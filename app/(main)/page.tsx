"use client";
import { Button } from "@/components/ui/button";
import ProgressGraph from "@/components/progress-graph";
import Link from "next/link";
import NotesPage from "@/components/Note";
import Todos from "@/components/todos";

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center m-auto pt-20 w-full">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold mb-4">
          Welcome to{" "}
          <span className="text-orange-500 underline underline-offset-8">
            TUDO
          </span>{" "}
          App
        </h1>
        <p className="text-sm text-center lg:text-lg text-muted-foreground max-w-xs md:max-w-md lg:max-w-xl xl:max-w-2xl mx-auto">
          Organize your tasks efficiently and boost your productivity with our
          simple yet powerful todo application.
        </p>
      </section>

      {/* Graph Section */}
      <section id="stats" className="py-20">
        <ProgressGraph />
      </section>

      <hr />

      {/* Todos Section */}
      <section id="stats" className="">
        <Todos />
      </section>

      <hr />

      {/* Features Section */}
      <section id="features" className="py-20">
        <h2 className="text-2xl md:text-4xl font-bold mb-8">Features</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Easy to Use",
              description:
                "Simple interface that helps you focus on your tasks.",
              icon: "👍",
            },
            {
              title: "Dark Mode",
              description:
                "Eye-friendly dark mode for comfortable night-time use.",
              icon: "🌙",
            },
            {
              title: "Fast & Reliable",
              description: "Built with Next.js for optimal performance.",
              icon: "⚡",
            },
          ].map((feature, index) => (
            <div key={index} className="border rounded-lg p-6 text-center">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <hr />

      {/* CTA Section */}
      <section className="py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Ready to boost your productivity?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Start organizing your tasks today and experience the difference a
          well-managed todo list can make.
        </p>
        <Button size="lg" asChild>
          <Link href="/">Add Your First Todo</Link>
        </Button>
      </section>

      <NotesPage />
    </div>
  );
}
