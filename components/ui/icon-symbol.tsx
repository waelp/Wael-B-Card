// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: Record<string, MaterialIconName> = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "magnifyingglass": "search",
  "plus": "add",
  "camera.fill": "camera-alt",
  "photo.fill": "photo",
  "phone.fill": "phone",
  "envelope.fill": "email",
  "trash.fill": "delete",
  "gear": "settings",
  "xmark.circle.fill": "cancel",
  "tray.fill": "inbox",
  "list.bullet": "list",
  "square.grid.2x2.fill": "apps",
  "person.fill": "person",
  "pencil": "edit",
  "xmark": "close",
  "checkmark": "check",
  "building.2": "business",
  "building.2.fill": "business",
  "chart.bar.fill": "bar-chart",
  "doc.text.fill": "description",
  "square.and.arrow.up": "share",
  "globe": "language",
  "arrow.left": "arrow-back",
  "star.fill": "star",
  "tag.fill": "label",
  "calendar": "event",
  "funnel.fill": "filter-list",
  "creditcard": "credit-card",
  "creditcard.fill": "credit-card",
  "line.3.horizontal.decrease.circle": "filter-list",
  "exclamationmark.triangle.fill": "warning",
  "arrow.triangle.2.circlepath": "sync",
  "checkmark.shield.fill": "verified-user",
  "briefcase.fill": "work",
  "doc.badge.plus": "note-add",
  "arrow.down.doc.fill": "file-download",
  "tablecells": "table-chart",
};

type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
