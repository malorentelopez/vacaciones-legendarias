import { revalidatePath } from "next/cache";

export function revalidateMissionRelatedRoutes() {
  revalidatePath("/");
  revalidatePath("/ruta");
  revalidatePath("/missions");
  revalidatePath("/side-quests");
  revalidatePath("/achievements");
}

export function revalidateAvatarRoutes() {
  revalidatePath("/");
  revalidatePath("/avatar");
  revalidatePath("/ruta");
}
