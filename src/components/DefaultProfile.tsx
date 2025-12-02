import { UserIcon, Users } from "lucide-react-native";
import { View } from "react-native";

export function DefaultUserProfile({ style }: { style: any }) {
  return (
    <View style={style}>
      <UserIcon size={28} color="#000000" />
    </View>
  );
}

export function DefaultGroupProfile({ style }: { style: any }) {
  return (
    <View style={style}>
      <Users size={28} color="#000000" />
    </View>
  );
}
