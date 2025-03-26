import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
type LogoProps = {
  srcURL: string;
  children: React.ReactElement | string;
};

export default function Logo(props: LogoProps) {
  const { srcURL, children } = props;
  return (
    <div className="flex flex-row items-center">
      <Avatar>
        <AvatarImage src={srcURL} alt="@shadcn" />
        <AvatarFallback></AvatarFallback>
      </Avatar>
      <p className="p-2">{children}</p>
    </div>
  );
}
