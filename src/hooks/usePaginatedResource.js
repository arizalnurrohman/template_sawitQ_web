import { useState } from "react";
import useApiResource from "./useApiResource.js";

export default function usePaginatedResource(
  endpoint,
  { filterName, revision = 0 } = {},
) {
  const [page, setPage] = useState(1);
  const [filter, updateFilter] = useState("");
  const params = new URLSearchParams({ page });
  if (filter && filterName) params.set(filterName, filter);
  const { data, loading, error, reload } = useApiResource(
    `${endpoint}?${params}`,
    revision,
  );

  function setFilter(value) {
    updateFilter(value);
    setPage(1);
  }

  return {
    result: { ...data, data: data?.data || [], loading, error },
    page,
    setPage,
    filter,
    setFilter,
    reload,
  };
}
