import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
type LogoProps = {
  srcURL: string;
  children: React.ReactElement | string;
};

export default function Logo(props: LogoProps) {
  const { srcURL, children } = props;
  return (
    <div className="flex flex-row items-center h-20 ">
      <Avatar>
        <AvatarImage src={srcURL} alt="@shadcn" />
        <AvatarFallback></AvatarFallback>
      </Avatar>
      <p>{children}</p>
    </div>
  );
}
