/**
 * Componente de barra de búsqueda con debounce
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  debounceMs?: number;
}

export default function SearchBar({ 
  value, 
  onChangeText, 
  placeholder = "Buscar...", 
  onClear,
  debounceMs = 300
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      onChangeText(localValue);
    }, debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [localValue, debounceMs]);

  const handleClear = () => {
    setLocalValue('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={localValue}
        onChangeText={setLocalValue}
      />
      {localValue.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Text style={styles.clearText}>X</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 12,
  },
  clearText: {
    color: '#6B7280',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
