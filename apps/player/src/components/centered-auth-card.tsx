import { AppLogo, Card, CardContent, CardHeader } from "@repo/ui";

export function CenteredAuthCard({
  children,
  header,
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4">
      <Card className="w-full max-w-md border-violet-500/30">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-full max-w-xs px-2">
            <AppLogo variant="full" fullWidth priority />
          </div>
          {header}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
