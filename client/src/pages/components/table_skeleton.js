import { Skeleton, Stack } from "@mui/material";

export function TableSkeleton({
  width = "80vw",
header_height = "3vh",
  row_height = "10vh",
}) {
  return (
    <Stack sx={{ width: width }} spacing={2}>
      <Skeleton variant="rectangular" width={width} height={header_height} />
      {Array.from(new Array(7)).map((_, index) => (
        <Skeleton
          key={index}
          variant="rectangular"
          width={width}
          height="10vh"
        />
      ))}
    </Stack>
  );
}
