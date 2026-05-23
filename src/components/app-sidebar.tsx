import * as React from "react";
import {
  IconFileDescription,
  IconFileWord,
  IconPlayerPlay,
  IconInfoCircle,
  // IconInnerShadowTop
} from "@tabler/icons-react";
// import { useNavigate, useLocation } from 'react-router-dom';
// import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main";
// import { NavSecondary } from "@/components/nav-secondary";
// import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  // SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  // SidebarGroup,
  // SidebarGroupContent,
  // SidebarGroupLabel,
} from "@/components/ui/sidebar";

const navigation = [
    {
      title: "My Quizzes",
      url: "/",
      icon: IconFileDescription, // list of quizzes
    },
    {
      title: "Create",
      url: "/create",
      icon: IconFileWord, // create a new quiz
    },
    {
      title: "Play Quiz",
      url: "/play",
      icon: IconPlayerPlay, // play quizzes
    },
    {
      title: "About Quizey",
      url: "/about",
      icon: IconInfoCircle, // info/about page
    },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
            <span>
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Quizey Logo" className="w-5 h-5 object-contain" />
              <span className="text-base font-semibold ml-2">Quizey</span>
            </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <NavMain items={navigation} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter> */}
    </Sidebar>
  )
}
