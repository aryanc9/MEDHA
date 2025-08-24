import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  fullHeight?: boolean;
}

export function FeatureCard({ title, description, href, icon, fullHeight = false }: FeatureCardProps) {
  return (
    <Card className={cn("flex flex-col justify-between hover:shadow-lg transition-shadow", fullHeight && "h-full")}>
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle className="font-headline">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button asChild variant="link" className="p-0">
          <Link href={href}>
            Explore Feature <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
