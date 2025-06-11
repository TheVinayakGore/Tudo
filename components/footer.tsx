"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FaTwitter,
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaYoutube,
  FaDiscord,
} from "react-icons/fa";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function Footer() {
  const socialLinks = [
    {
      icon: <FaTwitter className="h-5 w-5" />,
      href: "https://twitter.com",
      label: "Twitter",
    },
    {
      icon: <FaGithub className="h-5 w-5" />,
      href: "https://github.com",
      label: "GitHub",
    },
    {
      icon: <FaLinkedin className="h-5 w-5" />,
      href: "https://linkedin.com",
      label: "LinkedIn",
    },
    {
      icon: <FaInstagram className="h-5 w-5" />,
      href: "https://instagram.com",
      label: "Instagram",
    },
    {
      icon: <FaYoutube className="h-5 w-5" />,
      href: "https://youtube.com",
      label: "YouTube",
    },
    {
      icon: <FaDiscord className="h-5 w-5" />,
      href: "https://discord.com",
      label: "Discord",
    },
  ];

  return (
    <footer className="bg-gradient-to-br from-zinc-100 via-white to-zinc-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 text-gray-800 dark:text-white border-t">
      {/* CTA */}
      <div className="px-6 md:px-20 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
          Boost your productivity today
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-6">
          Join thousands organizing their tasks efficiently with our Tudo App.
        </p>
        <div className="flex w-full max-w-md mx-auto items-center gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            className="flex-1 rounded-full px-5 py-2"
          />
          <Button type="submit" className="rounded-full px-6">
            Get Started
          </Button>
        </div>
      </div>

      {/* Footer Main */}
      <main className="px-6 md:px-20 pb-10">
        <div className="flex flex-col md:flex-row justify-between gap-10 bg-muted/40 p-8 rounded-2xl border border-dashed">
          {/* Info */}
          <div className="flex-1">
            <Link
              href="/"
              className="flex items-center gap-2 text-2xl md:text-4xl font-extrabold"
            >
              <Image
                src="/logo.png"
                alt="logo"
                width={50}
                height={50}
                className="w-12"
              />
              <span>TUDO</span>
            </Link>
            <p className="mt-3 text-muted-foreground max-w-sm">
              The simplest way to organize your tasks and boost your
              productivity.
            </p>
            <div className="grid grid-cols-3 xl:grid-cols-6 gap-4 mt-8 w-full xs:w-1/4 sm:w-1/3 lg:w-1/3 xl:w-1/4">
              {socialLinks.map((social, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="icon"
                  asChild
                  className="hover:scale-125 transition-all duration-200 rounded-full"
                >
                  <Link
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                  >
                    {social.icon}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="flex items-end justify-center md:justify-end text-muted-foreground text-sm">
            © {new Date().getFullYear()} TUDO. All rights reserved.
          </div>
        </div>
      </main>
    </footer>
  );
}
