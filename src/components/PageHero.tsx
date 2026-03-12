interface PageHeroProps {
  image: string;
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
}

export default function PageHero({ image, title, subtitle, icon }: PageHeroProps) {
  return (
    <div className="relative h-48 sm:h-56 -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 mb-8 overflow-hidden rounded-b-2xl">
      <img src={image} alt={title} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
      <div className="absolute inset-0 flex items-center">
        <div className="container">
          <div className="flex items-center gap-3 mb-2">
            {icon}
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground">{title}</h1>
          </div>
          <p className="text-primary-foreground/80 max-w-lg">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
