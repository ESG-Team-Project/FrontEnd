import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";

export default function NaviBar() {
  return (
    <NavigationMenu className="justify-between min-w-full p-4 bg-white shadow">
      <NavigationMenuList>
        <Logo srcURL="https://github.com/shadcn.png">logotest</Logo>
      </NavigationMenuList>
      <NavigationMenuList>
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
      <NavigationMenuList>
        <Avatar>
          <AvatarImage src="https://avatars.githubusercontent.com/u/118759932?v=4&size=64" />
          <AvatarFallback>CNs</AvatarFallback>
        </Avatar>
        <Link href="r" legacyBehavior passHref>
          <Button>대시보드 시작하기</Button>
        </Link>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
