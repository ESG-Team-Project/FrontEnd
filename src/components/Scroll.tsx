import React from "react";
import { ScrollArea } from "./ui/scroll-area";

type ScrollProps = {
  className: string;
  children: React.ReactElement;
};
export default function ScrollContainer(props: ScrollProps) {
  const { className, children } = props;
  return (
    <ScrollArea className={className}>
      <div>{children}</div>
    </ScrollArea>
  );
}
