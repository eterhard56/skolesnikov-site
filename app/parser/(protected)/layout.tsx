import { redirect } from "next/navigation";
import { getParserSession } from "@/lib/parser/session";
import { PARSER_LOGIN_PATH } from "@/lib/parser/routes";

export default async function ProtectedParserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await getParserSession();
  if (!authed) {
    redirect(PARSER_LOGIN_PATH);
  }

  return children;
}
