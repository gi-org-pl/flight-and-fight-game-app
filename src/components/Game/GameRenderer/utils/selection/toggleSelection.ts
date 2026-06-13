export const toggleSelection = (
  selection: string[],
  id: string,
  max: number,
): string[] => {
  if (selection.includes(id)) {
    return selection.filter((current) => current !== id);
  }

  if (selection.length >= max) {
    return selection;
  }

  return [...selection, id];
};
