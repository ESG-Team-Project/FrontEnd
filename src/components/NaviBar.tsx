import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";

export default function NaviBar() {
  return (
    <NavigationMenu className="sticky top-0 justify-between bg-white shadow-sm max-w-screen">
      <NavigationMenuList className="flex flex-row px-2">
        <Logo srcURL="https://github.com/shadcn.png">logotest</Logo>
      </NavigationMenuList>
      <NavigationMenuList className="flex flex-row px-2">
        <NavigationMenuItem>
          <Link href="경로" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              ESG Dashboard
            </NavigationMenuLink>
          </Link>
          <Link href="경로" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              ESG DATA POOL
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuList className="flex flex-row px-2">
        <Avatar>
          <AvatarImage src="https://avatars.githubusercontent.com/u/118759932?v=4&size=64" />
          <AvatarFallback>CNs</AvatarFallback>
        </Avatar>
        <Button>Button</Button>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
