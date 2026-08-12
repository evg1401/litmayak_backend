export const isTimeOver = (tiemSec: number, intervalSec: number) => {
  const now = Date.now();
  return now - tiemSec < intervalSec * 1000;
};

export const isTimeExpired = (timeSecs: number) =>
  Math.floor(Date.now() / 1000) > timeSecs;

export const getOffsetFromPage = (page: number, limit: number) => {
  if (page <= 1) {
    return 0;
  }

  return (page - 1) * limit;
};
