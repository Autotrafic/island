import React, { useCallback, useMemo, useRef, useState } from "react";
import axios from "axios";
import type { AxiosInstance } from "axios";

const backendUrl = "https://api.autotrafic.es";

const invoicesBatchSize = 1;
const errorsBatchSize = 50;

const delayBetweenBatchesMs = 3000;
const estimatedInvoiceBatchSeconds = 4;
const estimatedErrorBatchSeconds = 4;

const retryDelayAfterBatchErrorSeconds = 60;
const maxRetries503 = 3;

type ProgressPhase =
  | "idle"
  | "fetching"
  | "checkingErrors"
  | "generatingInvoices"
  | "waitingAfterError"
  | "downloading"
  | "done"
  | "error";

type UiState = {
  phase: ProgressPhase;
  message: string;
  percent: number;
  detail?: string;
  error?: string;
};

type BatchError = {
  phase: "checkingErrors" | "generatingInvoices";
  batchIndex: number;
  message: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatSecondsToMinutesSeconds(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function calcPercent(done: number, total: number) {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
}

function getErrorMessage(error: any) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    "Error desconocido"
  );
}

function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function base64ToBlob(base64: string, mimeType: string) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
}

function downloadFile(base64: string, mimeType: string, fileName: string) {
  const blob = base64ToBlob(base64, mimeType);
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
}

function downloadPdf(
  pdfBase64: string,
  fileName = "Facturas clientes AutoTrafic.pdf"
) {
  downloadFile(pdfBase64, "application/pdf", fileName);
}

function downloadExcel(excelBase64: string) {
  downloadFile(
    excelBase64,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Facturas clientes AutoTrafic.xlsx"
  );
}

async function retry503<T>(
  fn: () => Promise<T>,
  retries = maxRetries503,
  delayMs = 5000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const status = error?.response?.status;

    if (status === 503 && retries > 0) {
      await sleep(delayMs);
      return retry503(fn, retries - 1, delayMs * 2);
    }

    throw error;
  }
}

async function generateInvoicesErrors(
  axiosInstance: AxiosInstance,
  options: any
) {
  const response = await axiosInstance.post(
    `${backendUrl}/invoice/generate-multiple-invoices-errors-pdf`,
    options
  );

  return response.data;
}

async function generateInvoices(axiosInstance: AxiosInstance, options: any) {
  const response = await axiosInstance.post(
    `${backendUrl}/invoice/generate-multiple-invoices-pdf`,
    options
  );

  return response.data;
}

function calculateEstimatedSeconds(params: {
  errorsTotalBatches: number;
  invoicesTotalBatches?: number;
}) {
  const errorsSeconds =
    params.errorsTotalBatches *
    (estimatedErrorBatchSeconds + delayBetweenBatchesMs / 1000);

  const invoicesSeconds = params.invoicesTotalBatches
    ? params.invoicesTotalBatches *
      (estimatedInvoiceBatchSeconds + delayBetweenBatchesMs / 1000)
    : 0;

  return Math.ceil(errorsSeconds + invoicesSeconds);
}

export default function AutoTraficInvoiceGenerator() {
  const [ui, setUi] = useState<UiState>({
    phase: "idle",
    message: "Listo para generar facturas del trimestre actual.",
    percent: 0,
  });

  const [batchErrors, setBatchErrors] = useState<BatchError[]>([]);
  const [showOmitDialog, setShowOmitDialog] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const [totalEstimatedSeconds, setTotalEstimatedSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [errorCountdown, setErrorCountdown] = useState<number | null>(null);

  const abortRef = useRef(false);
  const omitResolverRef = useRef<((value: boolean | null) => void) | null>(
    null
  );

  const canStart = !isRunning && ui.phase !== "fetching";

  const setPhase = useCallback(
    (phase: ProgressPhase, message: string, percent = 0, detail?: string) => {
      setUi({
        phase,
        message,
        percent,
        detail,
        error: undefined,
      });
    },
    []
  );

  const askOmitErrors = useCallback((): Promise<boolean | null> => {
    setShowOmitDialog(true);

    return new Promise((resolve) => {
      omitResolverRef.current = resolve;
    });
  }, []);

  const resolveOmitErrors = useCallback((value: boolean | null) => {
    setShowOmitDialog(false);
    omitResolverRef.current?.(value);
    omitResolverRef.current = null;
  }, []);

  const reduceRemainingTime = useCallback((seconds: number) => {
    setRemainingSeconds((prev) => Math.max(0, prev - seconds));
  }, []);

  const waitWithCountdown = useCallback(
    async (seconds: number) => {
      for (let i = seconds; i > 0; i--) {
        if (abortRef.current) return;

        setErrorCountdown(i);
        setRemainingSeconds((prev) => Math.max(0, prev - 1));

        await sleep(1000);
      }

      setErrorCountdown(null);
    },
    []
  );

  const normalSleepBetweenBatches = useCallback(async () => {
    const seconds = Math.ceil(delayBetweenBatchesMs / 1000);

    for (let i = 0; i < seconds; i++) {
      if (abortRef.current) return;

      reduceRemainingTime(1);
      await sleep(1000);
    }
  }, [reduceRemainingTime]);

  const cancel = useCallback(() => {
    abortRef.current = true;
    resolveOmitErrors(null);

    setIsRunning(false);
    setErrorCountdown(null);
    setRemainingSeconds(0);
    setTotalEstimatedSeconds(0);

    setUi({
      phase: "idle",
      message: "Proceso cancelado.",
      percent: 0,
    });
  }, [resolveOmitErrors]);

  const run = useCallback(async () => {
    try {
      abortRef.current = false;
      setIsRunning(true);
      setBatchErrors([]);
      setErrorCountdown(null);
      setTotalEstimatedSeconds(0);
      setRemainingSeconds(0);

      setPhase("fetching", "Obteniendo pedidos del trimestre actual…", 0);

      const actualTrimesterOrdersResponse = await axios.get(
        `${backendUrl}/order/totalum/get-actual-trimester-orders`
      );

      const actualTrimesterOrders = actualTrimesterOrdersResponse.data as any[];

      if (abortRef.current) return;

      const numberOfOrders = actualTrimesterOrders.length;

      if (!numberOfOrders) {
        setUi({
          phase: "done",
          message: "No hay pedidos para facturar este trimestre.",
          percent: 100,
        });
        return;
      }

      setPhase(
        "idle",
        "¿Quieres omitir las facturas con errores?",
        0,
        "Selecciona una opción para continuar."
      );

      const ignoreErrors = await askOmitErrors();

      if (abortRef.current) return;

      if (ignoreErrors === null) {
        setUi({
          phase: "idle",
          message: "Cancelado.",
          percent: 0,
        });
        return;
      }

      const errorsTotalBatches = Math.ceil(numberOfOrders / errorsBatchSize);
      const errorsRequestId = generateRequestId();

      const initialEstimatedSeconds = calculateEstimatedSeconds({
        errorsTotalBatches,
      });

      setTotalEstimatedSeconds(initialEstimatedSeconds);
      setRemainingSeconds(initialEstimatedSeconds);

      let errorsResult: any;

      setPhase(
        "checkingErrors",
        "Comprobando errores… No cierres esta ventana.",
        0,
        `Tiempo estimado inicial: ${formatSecondsToMinutesSeconds(
          initialEstimatedSeconds
        )}`
      );

      for (let i = 0; i < errorsTotalBatches; i++) {
        if (abortRef.current) return;

        const batch = actualTrimesterOrders.slice(
          i * errorsBatchSize,
          (i + 1) * errorsBatchSize
        );

        const isLastBatch = i === errorsTotalBatches - 1;

        setUi((prev) => ({
          ...prev,
          phase: "checkingErrors",
          message: `Comprobando errores… (${i + 1}/${errorsTotalBatches})`,
          percent: calcPercent(i, errorsTotalBatches),
        }));

        errorsResult = await retry503(() =>
          generateInvoicesErrors(axios, {
            requestId: errorsRequestId,
            isLastBatch,
            orders: batch,
            numberOfOrders,
            ignoreErrors,
          })
        );

        reduceRemainingTime(estimatedErrorBatchSeconds);

        setUi((prev) => ({
          ...prev,
          percent: calcPercent(i + 1, errorsTotalBatches),
        }));

        if (!errorsResult?.success && errorsResult?.completed) {
          setPhase(
            "downloading",
            "Se han encontrado errores. Descargando PDF con errores…",
            100
          );

          downloadPdf(
            errorsResult.pdfWithErrors,
            "Errores facturas clientes AutoTrafic.pdf"
          );

          setUi({
            phase: "done",
            message: errorsResult?.message ?? "Proceso completado con errores.",
            percent: 100,
            detail: "Revisa el PDF descargado con los errores.",
          });

          return;
        }

        if (errorsResult?.success && errorsResult?.completed) {
          break;
        }

        await normalSleepBetweenBatches();
      }

      if (!errorsResult?.success || !errorsResult?.completed) {
        throw new Error(
          errorsResult?.message ||
            "El backend no completó la validación de errores."
        );
      }

      const invoicesData = errorsResult.invoicesData as any[];
      const numberOfInvoicesData = invoicesData.length;

      if (!numberOfInvoicesData) {
        setUi({
          phase: "done",
          message: "No hay facturas para generar.",
          percent: 100,
        });
        return;
      }

      const invoicesTotalBatches = Math.ceil(
        numberOfInvoicesData / invoicesBatchSize
      );

      const fullEstimatedSeconds = calculateEstimatedSeconds({
        errorsTotalBatches,
        invoicesTotalBatches,
      });

      setTotalEstimatedSeconds(fullEstimatedSeconds);
      setRemainingSeconds(
        Math.max(
          remainingSeconds,
          invoicesTotalBatches *
            (estimatedInvoiceBatchSeconds + delayBetweenBatchesMs / 1000)
        )
      );

      const invoicesRequestId = generateRequestId();

      let invoicesResult: any;
      let omittedBatchesCount = 0;

      setPhase(
        "generatingInvoices",
        "¡No hay errores! Generando facturas… No cierres esta ventana.",
        0,
        `Tiempo estimado total: ${formatSecondsToMinutesSeconds(
          fullEstimatedSeconds
        )}`
      );

      for (let i = 0; i < invoicesTotalBatches; i++) {
        if (abortRef.current) return;

        const batch = invoicesData.slice(
          i * invoicesBatchSize,
          (i + 1) * invoicesBatchSize
        );

        const isLastBatch = i === invoicesTotalBatches - 1;

        setUi((prev) => ({
          ...prev,
          phase: "generatingInvoices",
          message: `Generando facturas… (${i + 1}/${invoicesTotalBatches})`,
          percent: calcPercent(i, invoicesTotalBatches),
        }));

        try {
          invoicesResult = await retry503(() =>
            generateInvoices(axios, {
              requestId: invoicesRequestId,
              isLastBatch,
              invoicesData: batch,
              numberOfInvoicesData,
            })
          );

          reduceRemainingTime(estimatedInvoiceBatchSeconds);

          setUi((prev) => ({
            ...prev,
            percent: calcPercent(i + 1, invoicesTotalBatches),
          }));

          if (invoicesResult?.success && invoicesResult?.completed) {
            setPhase("downloading", "Descargando PDF y Excel…", 100);

            downloadPdf(invoicesResult.invoicesPdf);
            downloadExcel(invoicesResult.invoicesExcel);
          }
        } catch (error: any) {
          omittedBatchesCount++;

          const errorMessage = getErrorMessage(error);

          setBatchErrors((prev) => [
            ...prev,
            {
              phase: "generatingInvoices",
              batchIndex: i + 1,
              message: errorMessage,
            },
          ]);

          setUi((prev) => ({
            ...prev,
            phase: "waitingAfterError",
            message: `Error en batch ${i + 1}. Se omite esta factura.`,
            detail:
              "El proceso continuará automáticamente después de 1 minuto para no saturar el backend.",
            percent: calcPercent(i + 1, invoicesTotalBatches),
          }));

          await waitWithCountdown(retryDelayAfterBatchErrorSeconds);
        }

        if (abortRef.current) return;

        await normalSleepBetweenBatches();
      }

      setErrorCountdown(null);
      setRemainingSeconds(0);

      setUi({
        phase: "done",
        message:
          invoicesResult?.message ||
          errorsResult?.message ||
          "Proceso terminado.",
        percent: 100,
        detail:
          omittedBatchesCount > 0
            ? `Se han omitido ${omittedBatchesCount} batches con error.`
            : "Todas las facturas se han procesado correctamente.",
      });
    } catch (error: any) {
      setUi((prev) => ({
        ...prev,
        phase: "error",
        message: "No se han podido generar las facturas.",
        error: getErrorMessage(error),
      }));
    } finally {
      setIsRunning(false);
    }
  }, [
    askOmitErrors,
    normalSleepBetweenBatches,
    reduceRemainingTime,
    remainingSeconds,
    setPhase,
    waitWithCountdown,
  ]);

  const phaseLabel = useMemo(() => {
    switch (ui.phase) {
      case "idle":
        return "Listo";
      case "fetching":
        return "Cargando pedidos";
      case "checkingErrors":
        return "Comprobando errores";
      case "generatingInvoices":
        return "Generando facturas";
      case "waitingAfterError":
        return "Pausa por error";
      case "downloading":
        return "Descargando";
      case "done":
        return "Finalizado";
      case "error":
        return "Error";
      default:
        return "";
    }
  }, [ui.phase]);

  return (
    <div className="min-h-screen w-full bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-5xl flex-col justify-center">
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
                AutoTrafic
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
                Generador de facturas trimestrales
              </h1>

              <p className="mt-4 max-w-2xl text-lg text-slate-300">
                Genera automáticamente las facturas del trimestre actual y
                descarga el PDF y el Excel final.
              </p>
            </div>

            <div className="flex min-w-[220px] flex-col gap-3">
              {isRunning ? (
                <button
                  onClick={cancel}
                  className="rounded-2xl bg-red-600 px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-red-500"
                >
                  Cancelar proceso
                </button>
              ) : (
                <button
                  onClick={run}
                  disabled={!canStart}
                  className="rounded-2xl bg-cyan-400 px-8 py-4 text-lg font-bold text-slate-950 shadow-lg hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Generar facturas
                </button>
              )}
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <div className="text-sm text-slate-400">Estado</div>
              <div className="mt-2 text-2xl font-bold text-white">
                {phaseLabel}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <div className="text-sm text-slate-400">Tiempo restante</div>
              <div className="mt-2 text-2xl font-bold text-cyan-300">
                {remainingSeconds > 0
                  ? formatSecondsToMinutesSeconds(remainingSeconds)
                  : "--:--"}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <div className="text-sm text-slate-400">Tiempo estimado total</div>
              <div className="mt-2 text-2xl font-bold text-white">
                {totalEstimatedSeconds > 0
                  ? formatSecondsToMinutesSeconds(totalEstimatedSeconds)
                  : "--:--"}
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-800 p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="text-lg font-semibold text-white">
                Progreso del proceso
              </div>
              <div className="text-lg font-bold text-cyan-300">
                {ui.percent}%
              </div>
            </div>

            <div className="mt-4 h-5 w-full overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full rounded-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${ui.percent}%` }}
              />
            </div>

            <div className="mt-5 text-lg text-slate-100">{ui.message}</div>

            {ui.detail ? (
              <div className="mt-2 text-sm text-slate-400">{ui.detail}</div>
            ) : null}

            {errorCountdown !== null ? (
              <div className="mt-6 rounded-2xl border border-amber-400 bg-amber-500/10 p-5">
                <div className="text-lg font-bold text-amber-300">
                  Pausa automática por error
                </div>

                <div className="mt-2 text-slate-200">
                  Se ha omitido el batch fallido. El proceso seguirá en:
                </div>

                <div className="mt-3 text-5xl font-black text-amber-300">
                  {formatSecondsToMinutesSeconds(errorCountdown)}
                </div>
              </div>
            ) : null}

            {ui.error ? (
              <div className="mt-5 rounded-2xl border border-red-400 bg-red-500/10 p-5 text-red-200">
                {ui.error}
              </div>
            ) : null}
          </div>

          {batchErrors.length > 0 ? (
            <div className="mt-6 rounded-2xl border border-amber-400 bg-amber-500/10 p-5">
              <div className="text-lg font-bold text-amber-300">
                Batches omitidos: {batchErrors.length}
              </div>

              <div className="mt-3 max-h-48 overflow-auto text-sm text-amber-100">
                {batchErrors.map((error, index) => (
                  <div
                    key={`${error.phase}-${error.batchIndex}-${index}`}
                    className="border-b border-amber-400/20 py-2 last:border-0"
                  >
                    Batch {error.batchIndex}: {error.message}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 text-sm text-slate-500">
            Backend: <span className="font-mono">{backendUrl}</span>
          </div>
        </div>
      </div>

      {showOmitDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-7 text-slate-950 shadow-2xl">
            <h3 className="text-2xl font-bold">Omitir facturas con errores</h3>

            <p className="mt-3 text-slate-600">
              ¿Quieres omitir las facturas que tengan errores?
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => resolveOmitErrors(true)}
                className="flex-1 rounded-2xl bg-cyan-500 px-6 py-4 text-lg font-bold text-slate-950 hover:bg-cyan-400"
              >
                Sí, omitir
              </button>

              <button
                onClick={() => resolveOmitErrors(false)}
                className="flex-1 rounded-2xl bg-slate-900 px-6 py-4 text-lg font-bold text-white hover:bg-slate-800"
              >
                No, incluir
              </button>
            </div>

            <button
              onClick={() => resolveOmitErrors(null)}
              className="mt-4 w-full rounded-2xl border border-slate-300 px-6 py-3 text-base font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}