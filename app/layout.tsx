import { Provider } from "@/components/ui/provider";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import "./globals.css";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Provider forcedTheme="light">
            <Navbar />
            {children}
          </Provider>
        </AuthProvider>
      </body>
    </html>
  );
}
