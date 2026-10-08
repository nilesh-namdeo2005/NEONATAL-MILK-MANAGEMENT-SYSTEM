const getPagination = (page, limit, total) => {
  const p = parseInt(page, 10) || 1;
  const l = Math.min(parseInt(limit, 10) || 10, 100);
  const skip = (p - 1) * l;

  return { page: p, limit: l, skip, total, pages: Math.ceil(total / l) };
};

export default getPagination;
