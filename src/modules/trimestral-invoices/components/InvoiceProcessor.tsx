import React, { useCallback, useMemo, useRef, useState } from "react";
import axios from "axios";
import type { AxiosInstance } from "axios";

const backendUrl = "https://api.autotrafic.es";

const invoicesBatchSize = 1;
const errorsBatchSize = 50;
const delayBetweenBatchesMs = 3000;
const maxRetries503 = 3;
const maxErrorsBeforeAsk = 5;

type ProgressPhase =
  | "idle"
  | "fetching"
  | "checkingErrors"
  | "generatingInvoices"
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

function downloadPdf(pdfBase64: string, fileName = "Facturas clientes AutoTrafic.pdf") {
  downloadFile(pdfBase64, "application/pdf", fileName);
}

function downloadExcel(excelBase64: string) {
  downloadFile(
    excelBase64,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Facturas clientes AutoTrafic.xlsx"
  );
}

function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
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

async function generateInvoicesErrors(axiosInstance: AxiosInstance, options: any) {
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

export default function AutoTraficInvoiceGenerator() {
  const [ui, setUi] = useState<UiState>({
    phase: "idle",
    message: "Listo para generar facturas del trimestre actual.",
    percent: 0,
  });

  const [batchErrors, setBatchErrors] = useState<BatchError[]>([]);
  const [showOmitDialog, setShowOmitDialog] = useState(false);
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const abortRef = useRef(false);
  const omitResolverRef = useRef<((value: boolean | null) => void) | null>(null);
  const continueResolverRef = useRef<((value: boolean) => void) | null>(null);

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

  const askContinueAfterErrors = useCallback((): Promise<boolean> => {
    setShowContinueDialog(true);

    return new Promise((resolve) => {
      continueResolverRef.current = resolve;
    });
  }, []);

  const resolveContinueAfterErrors = useCallback((value: boolean) => {
    setShowContinueDialog(false);
    continueResolverRef.current?.(value);
    continueResolverRef.current = null;
  }, []);

  const cancel = useCallback(() => {
    abortRef.current = true;
    resolveOmitErrors(null);
    resolveContinueAfterErrors(false);

    setIsRunning(false);
    setUi({
      phase: "idle",
      message: "Proceso cancelado.",
      percent: 0,
    });
  }, [resolveOmitErrors, resolveContinueAfterErrors]);

  const run = useCallback(async () => {
    try {
      abortRef.current = false;
      setIsRunning(true);
      setBatchErrors([]);

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

      const errorsBatchRequestTime = 0.33;
      const errorsTotalBatches = Math.ceil(numberOfOrders / errorsBatchSize);
      const errorsRequestId = generateRequestId();

      let errorsResult: any;

      setPhase(
        "checkingErrors",
        "Comprobando errores… No cierres esta ventana.",
        0,
        `Tiempo estimado: ${formatSecondsToMinutesSeconds(
          numberOfOrders * errorsBatchRequestTime
        )} min`
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

        await sleep(delayBetweenBatchesMs);
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

      const invoicesBatchRequestTime = 3.09;
      const invoicesTotalBatches = Math.ceil(numberOfInvoicesData / invoicesBatchSize);
      const invoicesRequestId = generateRequestId();

      let invoicesResult: any;
      let accumulatedErrors = 0;

      setPhase(
        "generatingInvoices",
        "¡No hay errores! Generando facturas… No cierres esta ventana.",
        0,
        `Tiempo estimado: ${formatSecondsToMinutesSeconds(
          numberOfInvoicesData * invoicesBatchRequestTime
        )} min`
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
          accumulatedErrors++;

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
            phase: "generatingInvoices",
            message: `Error en batch ${i + 1}. Se omite y continúa el proceso…`,
            detail: `${accumulatedErrors} errores acumulados.`,
            percent: calcPercent(i + 1, invoicesTotalBatches),
          }));

          if (accumulatedErrors >= maxErrorsBeforeAsk) {
            const shouldContinue = await askContinueAfterErrors();

            if (!shouldContinue) {
              setUi({
                phase: "error",
                message: "Proceso detenido por acumulación de errores.",
                percent: calcPercent(i + 1, invoicesTotalBatches),
                error: "Se han acumulado 5 errores en batches de facturación.",
              });

              return;
            }

            accumulatedErrors = 0;
          }
        }

        await sleep(delayBetweenBatchesMs);
      }

      setUi({
        phase: "done",
        message:
          invoicesResult?.message ||
          errorsResult?.message ||
          "Proceso terminado. Algunas facturas pueden haberse omitido si hubo errores.",
        percent: 100,
        detail:
          batchErrors.length > 0
            ? `Se han omitido ${batchErrors.length} batches con error.`
            : undefined,
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
    askContinueAfterErrors,
    askOmitErrors,
    batchErrors.length,
    setPhase,
  ]);

  const phaseLabel = useMemo(() => {
    switch (ui.phase) {
      case "idle":
        return "Listo";
      case "fetching":
        return "Cargando";
      case "checkingErrors":
        return "Comprobando errores";
      case "generatingInvoices":
        return "Generando facturas";
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
    <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Generador de facturas AutoTrafic
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Genera PDF y Excel de facturas del trimestre actual.
          </p>
        </div>

        <div>
          {isRunning ? (
            <button
              onClick={cancel}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
          ) : (
            <button
              onClick={run}
              disabled={!canStart}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Generar
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-800">
            {phaseLabel}
          </div>
          <div className="text-xs text-slate-600">{ui.percent}%</div>
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white">
          <div
            className="h-full bg-slate-900 transition-all"
            style={{ width: `${ui.percent}%` }}
          />
        </div>

        <div className="mt-3">
          <div className="text-sm text-slate-800">{ui.message}</div>

          {ui.detail ? (
            <div className="mt-1 text-xs text-slate-600">{ui.detail}</div>
          ) : null}

          {ui.error ? (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {ui.error}
            </div>
          ) : null}
        </div>
      </div>

      {batchErrors.length > 0 ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-sm font-semibold text-amber-900">
            Batches omitidos: {batchErrors.length}
          </div>

          <div className="mt-2 max-h-40 overflow-auto text-xs text-amber-800">
            {batchErrors.map((error, index) => (
              <div key={`${error.phase}-${error.batchIndex}-${index}`}>
                Batch {error.batchIndex}: {error.message}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {showOmitDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">
              Omitir facturas con errores
            </h3>

            <p className="mt-1 text-sm text-slate-600">
              ¿Quieres omitir las facturas que tengan errores?
            </p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => resolveOmitErrors(true)}
                className="flex-1 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Sí, omitir
              </button>

              <button
                onClick={() => resolveOmitErrors(false)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                No, incluir
              </button>
            </div>

            <button
              onClick={() => resolveOmitErrors(null)}
              className="mt-3 w-full rounded-xl px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {showContinueDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">
              Se han producido 5 errores
            </h3>

            <p className="mt-1 text-sm text-slate-600">
              Algunas requests de batches han fallado y se han omitido. ¿Quieres
              seguir con el procesado?
            </p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => resolveContinueAfterErrors(true)}
                className="flex-1 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Sí, seguir
              </button>

              <button
                onClick={() => resolveContinueAfterErrors(false)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Parar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4 text-xs text-slate-500">
        Backend: <span className="font-mono">{backendUrl}</span>
      </div>
    </div>
  );
}