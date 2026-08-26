import { Skeleton } from "@abek/awesome-ui";

export default function SkeletonBasic() {
  return (
    <div style={{ display: "grid", gap: "var(--aui-space-5)", width: "100%", maxWidth: "28rem" }}>
      <div style={{ display: "flex", gap: "var(--aui-space-3)", alignItems: "center" }}>
        <Skeleton variant="circle" width={40} />
        <div style={{ flex: 1 }}>
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="70%" />
        </div>
      </div>

      <Skeleton variant="text" lines={4} />
      <Skeleton height={120} animation="wave" />
    </div>
  );
}
