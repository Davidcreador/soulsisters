import { useState, useEffect, type FormEvent } from "react";
import { useAddProduct, useUpdateProduct, useGenerateUploadUrl, useImageUrl } from "../hooks/useInventory";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { calculateProfitPercentage } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToastContext } from "./ui/ToastProvider";
import type { Id } from "../../convex/_generated/dataModel";

const categories = [
  { value: "necklaces", label: "Collares" },
  { value: "earrings", label: "Aretes" },
  { value: "bracelets", label: "Pulseras" },
  { value: "rings", label: "Anillos" },
  { value: "sets", label: "Sets" },
  { value: "other", label: "Otros" },
];

interface Product {
  _id: string;
  name: string;
  quantity: number;
  storePrice: number;
  suggestedPrice: number;
  profitPercentage: number;
  category: string;
  status: string;
  notes?: string;
  image?: Id<"_storage">;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const generateUploadUrl = useGenerateUploadUrl();
  const { addToast } = useToastContext();

  const [formData, setFormData] = useState<{
    name: string;
    quantity: number;
    storePrice: number;
    suggestedPrice: number;
    profitPercentage: number;
    category: "necklaces" | "earrings" | "bracelets" | "rings" | "sets" | "other";
    status: "available" | "sold" | "low-stock";
    notes: string;
    image: Id<"_storage"> | undefined;
  }>({
    name: "",
    quantity: 0,
    storePrice: 0,
    suggestedPrice: 0,
    profitPercentage: 0,
    category: "necklaces",
    status: "available",
    notes: "",
    image: undefined,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Get image URL if editing a product with an image
  const existingImageUrl = useImageUrl(product?.image);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        quantity: product.quantity,
        storePrice: product.storePrice,
        suggestedPrice: product.suggestedPrice,
        profitPercentage: product.profitPercentage,
        category: product.category as "necklaces" | "earrings" | "bracelets" | "rings" | "sets" | "other",
        status: product.status as "available" | "sold" | "low-stock",
        notes: product.notes || "",
        image: product.image,
      });
      setSelectedFile(null);
    } else {
      setFormData({
        name: "",
        quantity: 0,
        storePrice: 0,
        suggestedPrice: 0,
        profitPercentage: 0,
        category: "necklaces",
        status: "available",
        notes: "",
        image: undefined,
      });
      setSelectedFile(null);
    }
  }, [product, isOpen]);

  useEffect(() => {
    const profit = calculateProfitPercentage(formData.storePrice, formData.suggestedPrice);
    setFormData((prev) => ({ ...prev, profitPercentage: profit }));
  }, [formData.storePrice, formData.suggestedPrice]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const uploadImage = async (file: File): Promise<Id<"_storage"> | undefined> => {
    try {
      // Step 1: Get upload URL
      const postUrl = await generateUploadUrl();
      
      // Step 2: Upload file
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      if (!result.ok) {
        throw new Error("Failed to upload image");
      }
      
      const { storageId } = await result.json();
      return storageId as Id<"_storage">;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      let imageId = formData.image;
      
      // Upload new image if selected
      if (selectedFile) {
        imageId = await uploadImage(selectedFile);
      }
      
      // Build update object with only defined values
      const updateData: any = {
        name: formData.name,
        quantity: formData.quantity,
        storePrice: formData.storePrice,
        suggestedPrice: formData.suggestedPrice,
        profitPercentage: formData.profitPercentage,
        category: formData.category,
        status: formData.status,
      };
      
      // Only add optional fields if they have values
      if (formData.notes && formData.notes.trim() !== "") {
        updateData.notes = formData.notes;
      }
      if (imageId) {
        updateData.image = imageId;
      }
      
      if (product) {
        await updateProduct({ 
          id: product._id as any, 
          ...updateData,
        });
        addToast({
          title: "Producto actualizado",
          description: `${formData.name} ha sido actualizado exitosamente`,
          type: "success",
        });
      } else {
        await addProduct(updateData);
        addToast({
          title: "Producto agregado",
          description: `${formData.name} ha sido agregado al inventario`,
          type: "success",
        });
      }
      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
      addToast({
        title: "Error",
        description: "No se pudo guardar el producto",
        type: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Get preview URL for selected file
  const getPreviewUrl = () => {
    if (selectedFile) {
      return URL.createObjectURL(selectedFile);
    }
    if (existingImageUrl) {
      return existingImageUrl;
    }
    return null;
  };

  const previewUrl = getPreviewUrl();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="modal-content w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">
                {product ? "Editar Producto" : "Agregar Producto"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Imagen del Producto</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <label className={`flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg cursor-pointer transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span className="text-sm">
                      {isUploading ? "Subiendo..." : "Subir imagen"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    {selectedFile.name} - La imagen se subirá al guardar
                  </p>
                )}
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Nombre</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="Nombre del producto"
                />
              </div>

              {/* Quantity and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Cantidad</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as "necklaces" | "earrings" | "bracelets" | "rings" | "sets" | "other" })}
                    className="input"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Precio Compra (CRC)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.storePrice}
                    onChange={(e) => setFormData({ ...formData, storePrice: parseInt(e.target.value) || 0 })}
                    className="input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Precio Venta (CRC)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.suggestedPrice}
                    onChange={(e) => setFormData({ ...formData, suggestedPrice: parseInt(e.target.value) || 0 })}
                    className="input"
                  />
                </div>
              </div>

              {/* Profit */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Ganancia (%)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={formData.profitPercentage}
                    readOnly
                    className="input bg-muted w-32"
                  />
                  <span className="text-sm text-muted-foreground">Calculado automáticamente</span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Notas (opcional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="input resize-none"
                  placeholder="Notas adicionales..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isUploading}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="btn btn-primary"
                >
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </span>
                  ) : (
                    product ? "Guardar Cambios" : "Agregar Producto"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
