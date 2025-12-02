import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TopProduct {
  name: string;
  quantity: number;
  total: number;
}

interface TopProductsProps {
  products: TopProduct[];
  currency: string;
}

export const TopProducts = ({ products, currency }: TopProductsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'BRL'
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Produtos Mais Vendidos</CardTitle>
        <CardDescription>Produtos mais populares hoje</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum produto vendido hoje
            </p>
          ) : (
            products.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center rounded-full">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.quantity} {product.quantity === 1 ? 'venda' : 'vendas'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(product.total)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
