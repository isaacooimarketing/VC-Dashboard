import './globals.css';

export const metadata = {
    title: 'Vortex Analytics | Sales Dashboard',
    description: 'AI-Powered Business Intelligence Dashboard',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
