import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { BusinessCard } from '@/types/business-card';
import { useColors } from '@/hooks/use-colors';
import { useI18n } from '@/lib/i18n';
import { IconSymbol } from './ui/icon-symbol';

const { width } = Dimensions.get('window');

interface DuplicateModalProps {
  visible: boolean;
  existingCard: BusinessCard | null;
  matchedValue: string;
  matchedField: 'mobile' | 'phone' | 'email';
  onReplace: () => void;
  onKeepOld: () => void;
  onCancel: () => void;
}

export function DuplicateModal({
  visible,
  existingCard,
  matchedValue,
  matchedField,
  onReplace,
  onKeepOld,
  onCancel,
}: DuplicateModalProps) {
  const colors = useColors();
  const { t, language } = useI18n();
  const isRTL = language === 'ar';

  if (!existingCard) return null;

  const fieldLabel = matchedField === 'mobile' 
    ? (language === 'ar' ? 'رقم الجوال' : 'Mobile Number')
    : matchedField === 'phone'
    ? (language === 'ar' ? 'رقم الهاتف' : 'Phone Number')
    : (language === 'ar' ? 'البريد الإلكتروني' : 'Email');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
      >
        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={SlideOutDown.duration(200)}
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          {/* Warning Icon */}
          <View style={[styles.iconContainer, { backgroundColor: colors.warning + '20' }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={40} color={colors.warning} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left' }]}>
            {language === 'ar' ? 'تم العثور على بطاقة مكررة!' : 'Duplicate Card Found!'}
          </Text>

          {/* Message */}
          <Text style={[styles.message, { color: colors.muted, textAlign: isRTL ? 'right' : 'left' }]}>
            {language === 'ar' 
              ? `${fieldLabel} "${matchedValue}" موجود بالفعل ومسجل باسم:`
              : `${fieldLabel} "${matchedValue}" already exists and is registered to:`}
          </Text>

          {/* Existing Card Info */}
          <View style={[styles.cardInfo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.cardRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <IconSymbol name="person.fill" size={20} color={colors.primary} />
              <Text style={[styles.cardName, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left' }]}>
                {existingCard.fullName || `${existingCard.firstName} ${existingCard.lastName}`}
              </Text>
            </View>
            {existingCard.companyName && (
              <View style={[styles.cardRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <IconSymbol name="building.2.fill" size={18} color={colors.muted} />
                <Text style={[styles.cardDetail, { color: colors.muted }]}>
                  {existingCard.companyName}
                </Text>
              </View>
            )}
            {existingCard.jobTitle && (
              <View style={[styles.cardRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <IconSymbol name="briefcase.fill" size={18} color={colors.muted} />
                <Text style={[styles.cardDetail, { color: colors.muted }]}>
                  {existingCard.jobTitle}
                </Text>
              </View>
            )}
            <View style={[styles.cardRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <IconSymbol name="phone.fill" size={18} color={colors.muted} />
              <Text style={[styles.cardDetail, { color: colors.muted }]}>
                {matchedValue}
              </Text>
            </View>
          </View>

          {/* Question */}
          <Text style={[styles.question, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left' }]}>
            {language === 'ar' 
              ? 'ماذا تريد أن تفعل؟'
              : 'What would you like to do?'}
          </Text>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            {/* Replace Button */}
            <TouchableOpacity
              style={[styles.button, styles.replaceButton, { backgroundColor: colors.primary }]}
              onPress={onReplace}
              activeOpacity={0.8}
            >
              <IconSymbol name="arrow.triangle.2.circlepath" size={20} color="#fff" />
              <Text style={styles.buttonText}>
                {language === 'ar' 
                  ? 'حفظ الجديد وحذف القديم'
                  : 'Save New & Delete Old'}
              </Text>
            </TouchableOpacity>

            {/* Keep Old Button */}
            <TouchableOpacity
              style={[styles.button, styles.keepButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={onKeepOld}
              activeOpacity={0.8}
            >
              <IconSymbol name="checkmark.shield.fill" size={20} color={colors.foreground} />
              <Text style={[styles.buttonTextSecondary, { color: colors.foreground }]}>
                {language === 'ar' 
                  ? 'الاحتفاظ بالقديم'
                  : 'Keep Old Card'}
              </Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={[styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelText, { color: colors.muted }]}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: width - 40,
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    width: '100%',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
    width: '100%',
  },
  cardInfo: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 10,
  },
  cardRow: {
    alignItems: 'center',
    gap: 10,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  cardDetail: {
    fontSize: 14,
    flex: 1,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    width: '100%',
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 10,
  },
  replaceButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  keepButton: {
    borderWidth: 1.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
