import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const prods = await AsyncStorage.getItem('@Carrinho');

      if (prods) {
        setProducts(JSON.parse(prods));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const produtos = [...products];
      const indexProduct = produtos.findIndex(prod => {
        return prod.id === product.id;
      });

      if (indexProduct >= 0) {
        produtos[indexProduct].quantity += 1;
        setProducts([...produtos]);
        console.log(produtos[indexProduct].quantity);
        await AsyncStorage.setItem('@Carrinho', JSON.stringify(produtos));
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
        await AsyncStorage.setItem('@Carrinho', JSON.stringify(products));
        console.log('Poduto novo');
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const produtos = [...products];
      const indexProduct = produtos.findIndex(prod => {
        return prod.id === id;
      });

      if (indexProduct >= 0) {
        produtos[indexProduct].quantity += 1;
        setProducts([...produtos]);
        await AsyncStorage.setItem('@Carrinho', JSON.stringify(produtos));
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const produtos = [...products];
      const indexProduct = produtos.findIndex(prod => {
        return prod.id === id;
      });

      if (indexProduct >= 0 && produtos[indexProduct].quantity > 0) {
        produtos[indexProduct].quantity -= 1;
        setProducts([...produtos]);
        await AsyncStorage.setItem('@Carrinho', JSON.stringify(produtos));
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
