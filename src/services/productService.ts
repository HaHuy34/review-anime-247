import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/src/firebase/config";

export interface Product {
  id?: string;
  name: string;
  image: string;
  link: string;
  description: string;
  order?: number;
}

export const getProducts = async () => {
  const q = query(collection(db, "shopee_products"));
  const snapshot = await getDocs(q);
  const products = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Product[];
  return products;
};

export const addProduct = async (data: Product) => {
  return await addDoc(collection(db, "shopee_products"), data);
};

export const updateProduct = async (id: string, data: Partial<Product>) => {
  const d = doc(db, "shopee_products", id);
  await updateDoc(d, data);
};

export const deleteProduct = async (id: string) => {
  const d = doc(db, "shopee_products", id);
  await deleteDoc(d);
};
