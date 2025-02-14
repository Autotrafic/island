export function formatDate (timestamp: number) {
    return new Date(timestamp * 1000).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

export function shouldRenderDateSeparator (currentTimestamp: number, previousTimestamp: number | null) {
    if (!previousTimestamp) return true; // Always render for the first message
    const currentDate = formatDate(currentTimestamp);
    const previousDate = formatDate(previousTimestamp);
    return currentDate !== previousDate;
  };