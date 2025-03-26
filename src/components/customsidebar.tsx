import {
  SidebarInset,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./ui/collapsible";

type SidebarProps = {
  title: string;
  children: React.ReactElement;
};

export default function CustomSidebar(props: SidebarProps) {
  const { title, children } = props;

  return (
    <SidebarInset className="bg-emerald-100 w-fit">
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger>{title}</CollapsibleTrigger>

            <CollapsibleContent>
              <SidebarGroupContent>{children}</SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroupLabel>
        </SidebarGroup>
      </Collapsible>
    </SidebarInset>
  );
}
