import { useLocation } from "react-router-dom"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "./mode-toggle"

export function SiteHeader() {
  const location = useLocation()

  const isUUID = (str: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

  const getTitle = (pathname: string) => {
    if (pathname === "/") return "My Quizzes"

    const parts = pathname.split("/").filter(Boolean)

    const hasUUID = parts.some(isUUID)

    const meaningful = parts.filter(p => !isUUID(p))

    let title = meaningful
      .map(p => p.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()))
      .join(" / ")

    if (meaningful[0] === "create" && hasUUID) {
      title = "Update"
    } else if (!title) {
      title = "Home"
    }

    return title
  }

  const title = getTitle(location.pathname)

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
