import { CustomerMenuItemCard } from "./CustomerMenuItemCard";

interface CategorySectionProps {
  category: any;
  items: any[];
  currency: string;
}

export const CategorySection = ({ category, items, currency }: CategorySectionProps) => {
  return (
    <section id={`category-${category.id}`} className="scroll-mt-20">
      <div className="mb-4">
        <h3 className="text-2xl font-bold">{category.name}</h3>
        {category.description && (
          <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
        )}
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <CustomerMenuItemCard key={item.id} item={item} currency={currency} />
        ))}
      </div>
    </section>
  );
};
