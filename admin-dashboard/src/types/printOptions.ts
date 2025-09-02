// Print Option Category Types
export type PrintOptionCategoryType = 'print_option' | 'production_option';

export interface PrintOptionCategoryData {
  id: string;
  name: string;
  type: PrintOptionCategoryType;
  description: string;
  icon: string;
  optionCount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Individual Print Option Types
export interface PrintOptionData {
  id: string;
  categoryId: string;
  name: string;
  displayName: string;
  description?: string;
  specifications: PrintOptionSpecifications;
  pricing: PrintOptionPricing;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

// Specifications for different option types
export interface PrintOptionSpecifications {
  // Paper specifications
  weight?: number; // e.g., 70, 90, 110
  weightUnit?: string; // e.g., 'lb', 'gsm'
  finish?: string; // e.g., 'glossy', 'matte', 'satin'
  color?: string; // e.g., 'white', 'cream', 'colored'
  
  // Format specifications
  width?: number;
  height?: number;
  unit?: string; // e.g., 'in', 'mm', 'cm'
  orientation?: 'portrait' | 'landscape';
  standardSize?: string; // e.g., 'Letter', 'A4', 'Tabloid'
  
  // Color specifications
  colorType?: 'full_color' | 'black_white' | 'spot_color';
  colorSpace?: 'CMYK' | 'RGB' | 'Pantone';
  inkCoverage?: number; // percentage
  
  // Pages specifications
  sides?: 'single' | 'double';
  pageLayout?: string; // e.g., '1-up', '2-up', '4-up'
  
  // Binding specifications
  bindingType?: string; // e.g., 'spiral', 'perfect', 'saddle_stitch'
  bindingPosition?: 'left' | 'top' | 'right';
  
  // Refinement specifications
  coating?: string; // e.g., 'UV', 'aqueous', 'lamination'
  coatingArea?: 'full' | 'spot';
  
  // Finishing specifications
  finishingType?: string; // e.g., 'cutting', 'folding', 'drilling'
  finishingDetails?: string;
  
  // Production specifications
  turnaroundTime?: number; // in days
  priority?: 'standard' | 'rush' | 'same_day';
  
  // Quantity specifications
  minQuantity?: number;
  maxQuantity?: number;
  quantityBreaks?: number[]; // e.g., [50, 100, 250, 500]
  
  // Proofing specifications
  proofType?: 'digital' | 'hard_copy' | 'press_proof';
  proofRequired?: boolean;
}

// Pricing structure for options
export interface PrintOptionPricing {
  basePrice?: number;
  priceType?: 'fixed' | 'per_unit' | 'per_sheet' | 'percentage';
  quantityPricing?: QuantityPricing[];
  setupFee?: number;
  additionalFees?: AdditionalFee[];
}

export interface QuantityPricing {
  minQuantity: number;
  maxQuantity?: number;
  price: number;
  priceType: 'per_unit' | 'per_sheet' | 'fixed';
}

export interface AdditionalFee {
  name: string;
  description?: string;
  amount: number;
  feeType: 'fixed' | 'percentage';
  condition?: string; // When this fee applies
}

// API Response Types
export interface PrintOptionCategoriesResponse {
  categories: PrintOptionCategoryData[];
  total: number;
}

export interface PrintOptionsResponse {
  options: PrintOptionData[];
  total: number;
  category: PrintOptionCategoryData;
}

// Form Types for Creating/Editing
export interface CreatePrintOptionCategoryRequest {
  name: string;
  type: PrintOptionCategoryType;
  description: string;
  icon: string;
}

export interface UpdatePrintOptionCategoryRequest extends Partial<CreatePrintOptionCategoryRequest> {
  id: string;
  isActive?: boolean;
}

export interface CreatePrintOptionRequest {
  categoryId: string;
  name: string;
  displayName: string;
  description?: string;
  specifications: PrintOptionSpecifications;
  pricing: PrintOptionPricing;
  sortOrder?: number;
}

export interface UpdatePrintOptionRequest extends Partial<CreatePrintOptionRequest> {
  id: string;
  isActive?: boolean;
}

// Filter and Search Types
export interface PrintOptionFilters {
  categoryId?: string;
  categoryType?: PrintOptionCategoryType;
  isActive?: boolean;
  search?: string;
  sortBy?: 'name' | 'created_at' | 'sort_order';
  sortOrder?: 'asc' | 'desc';
}

// Bulk Operations
export interface BulkPrintOptionOperation {
  action: 'activate' | 'deactivate' | 'delete' | 'update_category';
  optionIds: string[];
  data?: Partial<PrintOptionData>;
}
