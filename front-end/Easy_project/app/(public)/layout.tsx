import Wrapper from "../components/wrapper";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Wrapper>{children}</Wrapper>;
}
