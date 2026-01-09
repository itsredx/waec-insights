'use client';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, BrainCircuit, Menu, MessageSquare, ExternalLink, BookOpen, Github, Database, FileCode, Lightbulb } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';
import { Separator } from '@/components/ui/separator';

const navItems = [
    { href: '/', icon: <BarChart3 className="h-5 w-5" />, label: 'Dashboard' },
    { href: '/predict', icon: <BrainCircuit className="h-5 w-5" />, label: 'Predictor' },
    { href: '/chat', icon: <MessageSquare className="h-5 w-5" />, label: 'Data Assistant' },
    { href: '/improve', icon: <Lightbulb className="h-5 w-5" />, label: 'Ways to Improve' },
];

const resourceItems = [
    { href: 'https://colab.research.google.com/drive/1E1EAaA1PD_lhANkskrKctZYgHCLzUvgx?usp=sharing', icon: <BookOpen className="h-5 w-5" />, label: 'Colab Notebook', isExternal: true },
    { href: 'https://github.com/itsredx/waec-insights', icon: <Github className="h-5 w-5" />, label: 'Frontend Code', isExternal: true },
    { href: 'https://github.com/itsredx/waec-api', icon: <FileCode className="h-5 w-5" />, label: 'Backend Code', isExternal: true },
    { href: 'https://drive.google.com/drive/folders/1Oc7a07CibNJL_g5lCdZjb-uKvSJ7zNR5?usp=sharing', icon: <Database className="h-5 w-5" />, label: 'WAEC Data', isExternal: true },
];

function NavItem({ href, icon, label, isExternal = false }: { href: string; icon: React.ReactNode; label: string; isExternal?: boolean }) {
    const pathname = usePathname();
    const isActive = pathname === href;

    const content = (
        <>
            {icon}
            {label}
            {isExternal && <ExternalLink className="h-4 w-4 text-muted-foreground" />}
        </>
    );

    const className = cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        isActive && "bg-muted text-primary"
    );

    if (isExternal) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
                {content}
            </a>
        );
    }

    return (
        <Link href={href} className={className}>
            {content}
        </Link>
    );
}

export function AppLayout({ children }: { children: ReactNode }) {
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block sticky top-0 h-screen">
                <div className="flex h-full flex-col">
                    <div className="flex h-14 items-center border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <BarChart3 className="h-6 w-6 text-primary" />
                            <span>WAEC Insights</span>
                        </Link>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4 lg:py-2">
                            {navItems.map((item) => <NavItem key={item.href} {...item} />)}
                        </nav>
                        <Separator className="my-4" />
                        <div className="px-2 lg:px-4">
                            <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resources</h4>
                            <nav className="grid items-start gap-1 text-sm font-medium">
                                {resourceItems.map((item) => <NavItem key={item.href} {...item} />)}
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:h-[60px] lg:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col">
                            <nav className="grid gap-2 text-lg font-medium">
                                <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
                                    <BarChart3 className="h-6 w-6 text-primary" />
                                    <span>WAEC Insights</span>
                                </Link>
                                {navItems.map((item) => (
                                    <NavItem key={item.href} {...item} />
                                ))}
                            </nav>
                            <Separator className="my-4" />
                            <div>
                                <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resources</h4>
                                <nav className="grid gap-2 text-sm font-medium">
                                    {resourceItems.map((item) => (
                                        <NavItem key={item.href} {...item} />
                                    ))}
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        {/* You can add a search bar here if you want */}
                    </div>
                    <ThemeToggle />
                    <Button variant="outline" size="sm" asChild>
                        <Link
                            href="https://red-x.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span className="hidden sm:inline">Built by </span>
                            <span className="font-semibold text-primary ml-1.5 mr-1">AHMAD MB</span>
                            <ExternalLink className="h-4 w-4" />
                        </Link>
                    </Button>
                </header>
                <main className="flex flex-1 flex-col gap-4 bg-background p-4 md:gap-8 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}