export default function AboutPage() {
  return (
    <div className="space-y-6 pt-10">
      <h1 className="text-3xl font-bold">About Todo App</h1>
      <p className="text-lg">
        This Todo App is designed to help you organize your tasks efficiently.
        Built with modern web technologies, it offers a seamless experience
        across all devices.
      </p>

      <h2 className="text-2xl font-bold mt-8">Our Mission</h2>
      <p>
        We believe that productivity tools should be simple, intuitive, and
        accessible to everyone. Our mission is to provide a todo application
        that just works, without unnecessary complexity.
      </p>

      <h2 className="text-2xl font-bold mt-8">Technology Stack</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Next.js - The React Framework for Production</li>
        <li>Tailwind CSS - A utility-first CSS framework</li>
        <li>TypeScript - Typed JavaScript for better developer experience</li>
        <li>shadcn/ui - Beautifully designed components</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8">Team</h2>
      <p>
        This project is maintained by a single developer passionate about
        creating useful tools with great user experience.
      </p>
    </div>
  );
}
