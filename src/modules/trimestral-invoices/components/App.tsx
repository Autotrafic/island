import React, { useCallback, useMemo, useRef, useState } from "react";

// If your project already provides axios/types from Totalum, you can remove these minimal typings.
import type { AxiosInstance } from "axios";
import axios from "axios";

const backendUrl = "https://api.autotrafic.es";

type TotalumTriggerI = unknown;

type ModulesI = {
  axios: AxiosInstance;
};

type TotalumActionI = unknown;

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
  percent: number; // 0..100
  detail?: string;
  error?: string;
};

function base64ToBlob(base64: string, mimeType: string) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

function downloadPdf(pdfBase64: string) {
  const blob = base64ToBlob(pdfBase64, "application/pdf");
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "Facturas clientes AutoTrafic.pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function downloadExcel(excelBase64: string) {
  try {
    const binary = atob(excelBase64);
    const array: number[] = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    const blob = new Blob([new Uint8Array(array)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "Facturas clientes AutoTrafic.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading the Excel file", error);
  }
}

function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function generateInvoicesErrors(axios: AxiosInstance, options: any) {
  try {
    const response = await axios.post(
      `${backendUrl}/invoice/generate-multiple-invoices-errors-pdf`,
      options
    );

    return response.data;
  } catch (error: any) {
    throw new Error(
      `Error generando los errores de las facturas desde el backend: ${error?.message ?? error}`
    );
  }
}

async function generateInvoices(axios: AxiosInstance, options: any) {
  try {
    const response = await axios.post(
      `${backendUrl}/invoice/generate-multiple-invoices-pdf`,
      options
    );

    return response.data;
  } catch (error: any) {
    throw new Error(
      `Error generando las facturas desde el backend: ${error?.message ?? error}`
    );
  }
}

function formatSecondsToMinutesSeconds(seconds: number): string {
  if (seconds < 0) {
    throw new Error("Seconds cannot be negative");
  }

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function calcPercent(done: number, total: number) {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
}

/**
 * UI Component that reproduces EXACTLY the same runtime logic as your provided plugin code,
 * but replaces `alert()` and `prompt()` with a clean Tailwind UI.
 *
 * - Fetches actual trimester orders
 * - Prompts user to omit error invoices
 * - Batches error-check requests (50 orders each)
 * - If errors: downloads PDF with errors and stops
 * - If no errors: batches invoice generation (4 invoicesData each)
 * - On completion: downloads invoices PDF + Excel
 */
export default function AutoTraficInvoiceGenerator() {

  const [ui, setUi] = useState<UiState>({
    phase: "idle",
    message: "Listo para generar facturas del trimestre actual.",
    percent: 0,
  });

  const [omitErrors, setOmitErrors] = useState<boolean | null>(null);
  const [showOmitDialog, setShowOmitDialog] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Used to prevent multiple concurrent runs and allow cancellation.
  const abortRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  const canStart = useMemo(() => !isRunning && ui.phase !== "fetching", [isRunning, ui.phase]);

  const setPhase = useCallback((phase: ProgressPhase, message: string, percent = 0, detail?: string) => {
    setUi((prev) => ({ ...prev, phase, message, percent, detail, error: undefined }));
  }, []);

  const setError = useCallback((message: string) => {
    setUi((prev) => ({ ...prev, phase: "error", error: message, message: "No se han podido generar las facturas.", percent: prev.percent }));
  }, []);

  const cancel = useCallback(() => {
    abortRef.current.cancelled = true;
    setIsRunning(false);
    setUi({
      phase: "idle",
      message: "Proceso cancelado.",
      percent: 0,
    });
  }, []);

  const run = useCallback(async () => {
    try {
      abortRef.current.cancelled = false;
      setIsRunning(true);
      setOmitErrors(null);

      // 1) Fetch orders
      setPhase("fetching", "Obteniendo pedidos del trimestre actual…", 0);
      const actualTrimesterOrdersResponse = await axios.get(
        `${backendUrl}/order/totalum/get-actual-trimester-orders`
      );
      const actualTrimesterOrders = actualTrimesterOrdersResponse.data as any[];

      if (abortRef.current.cancelled) return;

      const numberOfOrders = actualTrimesterOrders.length;
      const errorsBatchSize = 50;
      const errorsBatchRequestTime = 0.33;
      const errorsTotalBatches = Math.ceil(numberOfOrders / errorsBatchSize);
      const errorsRequestId = generateRequestId();
      let errorsResult: any;

      // 2) Ask omit error invoices (prompt replacement)
      setShowOmitDialog(true);
      setPhase(
        "idle",
        "¿Quieres omitir las facturas con errores?",
        0,
        "Selecciona una opción para continuar."
      );

      // wait user decision
      const decision: boolean | null = await new Promise((resolve) => {
        const tick = () => {
          // If cancelled while waiting.
          if (abortRef.current.cancelled) return resolve(null);
          // once setOmitErrors changes, resolve
          if (omitErrors !== null) return resolve(omitErrors);
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });

      setShowOmitDialog(false);

      if (abortRef.current.cancelled) return;
      if (decision === null) {
        // Mimics original: return [] if user cancels
        setIsRunning(false);
        setUi({ phase: "idle", message: "Cancelado.", percent: 0 });
        return;
      }

      // 3) Start checking errors
      setPhase(
        "checkingErrors",
        `Comprobando errores… No cierres esta ventana.`,
        0,
        `Tiempo estimado: ${formatSecondsToMinutesSeconds(numberOfOrders * errorsBatchRequestTime)} min`
      );

      for (let i = 0; i < errorsTotalBatches; i++) {
        if (abortRef.current.cancelled) return;

        const batch = actualTrimesterOrders.slice(i * errorsBatchSize, (i + 1) * errorsBatchSize);
        const isLastBatch = i === errorsTotalBatches - 1;

        const options = {
          requestId: errorsRequestId,
          isLastBatch,
          orders: batch,
          numberOfOrders,
          ignoreErrors: decision,
        };

        setUi((prev) => ({
          ...prev,
          phase: "checkingErrors",
          message: `Comprobando errores… (${i + 1}/${errorsTotalBatches})`,
          percent: calcPercent(i, errorsTotalBatches),
        }));

        errorsResult = await generateInvoicesErrors(axios, options);

        // If errors and completed => download errors PDF (same logic)
        if (!errorsResult?.success && errorsResult?.completed) {
          setPhase(
            "downloading",
            "Se han encontrado errores. Descargando PDF con errores…",
            100
          );
          downloadPdf(errorsResult.pdfWithErrors);
          setIsRunning(false);
          setUi({
            phase: "done",
            message: errorsResult?.message ?? "Proceso completado con errores.",
            percent: 100,
            detail: "Revisa el PDF descargado con los errores.",
          });
          return;
        }

        // If no errors and completed => proceed
        if (errorsResult?.success && errorsResult?.completed) {
          const invoicesData = errorsResult.invoicesData as any[];

          const numberOfInvoicesData = invoicesData.length;
          const invoicesBatchSize = 4;
          const invoicesBatchRequestTime = 3.09;
          const invoicesTotalBatches = Math.ceil(numberOfInvoicesData / invoicesBatchSize);
          const invoicesRequestId = generateRequestId();
          let invoicesResult: any;

          setPhase(
            "generatingInvoices",
            "¡No hay errores! Generando facturas… No cierres esta ventana.",
            0,
            `Tiempo estimado: ${formatSecondsToMinutesSeconds(
              numberOfInvoicesData * invoicesBatchRequestTime
            )} min`
          );

          for (let j = 0; j < invoicesTotalBatches; j++) {
            if (abortRef.current.cancelled) return;

            const batch = invoicesData.slice(j * invoicesBatchSize, (j + 1) * invoicesBatchSize);
            const isLastBatch = j === invoicesTotalBatches - 1;

            const options = {
              requestId: invoicesRequestId,
              isLastBatch,
              invoicesData: batch,
              numberOfInvoicesData,
            };

            setUi((prev) => ({
              ...prev,
              phase: "generatingInvoices",
              message: `Generando facturas… (${j + 1}/${invoicesTotalBatches})`,
              percent: calcPercent(j, invoicesTotalBatches),
            }));

            invoicesResult = await generateInvoices(axios, options);

            if (invoicesResult?.success && invoicesResult?.completed) {
              setPhase("downloading", "Descargando PDF y Excel…", 100);
              downloadPdf(invoicesResult.invoicesPdf);
              downloadExcel(invoicesResult.invoicesExcel);
            }
          }

          setIsRunning(false);
          setUi({
            phase: "done",
            message: invoicesResult?.message ?? errorsResult?.message ?? "Completado.",
            percent: 100,
          });
          return;
        }
      }

      setIsRunning(false);
      setUi({ phase: "done", message: errorsResult?.message ?? "Completado.", percent: 100 });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error || error?.message || "Contacta con matenimiento";
      setIsRunning(false);
      setError(errorMessage);
    }
  }, [axios, omitErrors, setError, setPhase]);

  // --- UI ---

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
          <h2 className="text-xl font-semibold text-slate-900">Generador de facturas (AutoTrafic)</h2>
          <p className="mt-1 text-sm text-slate-600">
            Genera PDF + Excel de facturas del trimestre actual.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
          <div className="text-sm font-semibold text-slate-800">{phaseLabel}</div>
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
          {ui.detail ? <div className="mt-1 text-xs text-slate-600">{ui.detail}</div> : null}
          {ui.error ? (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {ui.error}
            </div>
          ) : null}
        </div>
      </div>

      {/* Omit errors modal */}
      {showOmitDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Omitir facturas con errores
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  ¿Quieres omitir las facturas que tengan errores?
                </p>
              </div>
              <button
                onClick={() => {
                  setOmitErrors(null);
                  setShowOmitDialog(false);
                  setIsRunning(false);
                  setUi({ phase: "idle", message: "Cancelado.", percent: 0 });
                }}
                className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-50"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setOmitErrors(true)}
                className="flex-1 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Sí, omitir
              </button>
              <button
                onClick={() => setOmitErrors(false)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                No, incluir
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Consejo: si eliges “No, incluir”, si hay errores se descargará un PDF con el detalle.
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-4 text-xs text-slate-500">
        Backend: <span className="font-mono">{backendUrl}</span>
      </div>
    </div>
  );
}
