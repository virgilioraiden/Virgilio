import { 
  Home, 
  Map, 
  Camera, 
  CheckCircle, 
  ClipboardList, 
  Hammer, 
  Image as ImageIcon,
  Loader2,
  ChevronRight,
  Plus,
  Trash2,
  FileText,
  Download,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';

export const ICONS = {
  Home,
  Map,
  Camera,
  CheckCircle,
  ClipboardList,
  Hammer,
  Image: ImageIcon,
  Loader: Loader2,
  ChevronRight,
  Plus,
  Trash: Trash2,
  FileText,
  Download,
  Alert: AlertTriangle,
  ArrowLeft
};

// Only use valid models from the guidance
export const MODEL_FAST = 'gemini-2.5-flash'; 
export const MODEL_REASONING = 'gemini-3-pro-preview'; 
// CRITICAL FIX: Use the stable model for image generation to avoid permissions errors
export const MODEL_IMAGE = 'gemini-2.5-flash-image';