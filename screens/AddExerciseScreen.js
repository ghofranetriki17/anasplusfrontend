import React, { useEffect, useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert 
} from 'react-native';
import { exerciseAPI, machineAPI } from '../services/api';

const AddExerciseScreen = ({ navigation }) => {
  const [machines, setMachines] = useState([]);
  const [movements, setMovements] = useState([]);
  const [charges, setCharges] = useState([]);

  const [selectedMachine, setSelectedMachine] = useState(null);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [selectedCharge, setSelectedCharge] = useState(null);

  const [name, setName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [instructions, setInstructions] = useState('');
  const [title, setTitle] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingCharges, setLoadingCharges] = useState(false);

  useEffect(() => {
    loadMachines();
    loadMovements();
  }, []);

  const loadMachines = async () => {
    try {
      const data = await machineAPI.getAll();  // Get all machines without branch filter
      setMachines(data);
    } catch (err) {
      console.error('Failed to load machines:', err);
      Alert.alert('Error', 'Failed to load machines');
    }
  };

  const loadMovements = async () => {
    try {
      const data = await exerciseAPI.getMovements();
      setMovements(data);
    } catch (err) {
      console.error('Failed to load movements:', err);
      Alert.alert('Error', 'Failed to load movements');
    }
  };

  useEffect(() => {
    if (selectedMachine) {
      loadCharges(selectedMachine.id);
    } else {
      setCharges([]);
      setSelectedCharge(null);
    }
  }, [selectedMachine]);

  const loadCharges = async (machineId) => {
    setLoadingCharges(true);
    try {
      const data = await exerciseAPI.getChargesForMachine(machineId);
      setCharges(data);
    } catch (err) {
      console.error('Failed to load charges:', err);
      Alert.alert('Error', 'Failed to load charges for selected machine');
    } finally {
      setLoadingCharges(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) return Alert.alert('Validation', 'Please enter exercise name');
    if (!sets || isNaN(sets) || sets < 1) return Alert.alert('Validation', 'Please enter valid sets');
    if (!reps || isNaN(reps) || reps < 1) return Alert.alert('Validation', 'Please enter valid reps');

    const exerciseData = {
      name,
      title: title.trim() || null,
      sets: Number(sets),
      reps: Number(reps),
      machine_id: selectedMachine ? selectedMachine.id : null,
      movement_id: selectedMovement ? selectedMovement.id : null,
      charge_id: selectedCharge ? selectedCharge.id : null,
      instructions: instructions.trim() || null,
    };

    setLoading(true);
    try {
      await exerciseAPI.create(exerciseData);
      Alert.alert('Success', 'Exercise added successfully');
      navigation.goBack();
    } catch (err) {
      console.error('Failed to add exercise:', err);
      Alert.alert('Error', 'Failed to add exercise');
    } finally {
      setLoading(false);
    }
  };

  // SelectInput component
  const SelectInput = ({ label, data, selectedValue, onSelect, keyExtractor, labelExtractor }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.selectContainer}>
        {data.length === 0 ? (
          <Text style={styles.noDataText}>No options available</Text>
        ) : (
          data.map(item => (
            <TouchableOpacity
              key={keyExtractor(item)}
              style={[
                styles.option,
                selectedValue?.id === keyExtractor(item) && styles.optionSelected
              ]}
              onPress={() => onSelect(item)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedValue?.id === keyExtractor(item) && styles.optionTextSelected
                ]}
              >
                {labelExtractor(item)}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Add New Exercise</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Exercise Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter exercise name"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Title (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter title"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <SelectInput 
        label="Select Machine"
        data={machines}
        selectedValue={selectedMachine}
        onSelect={setSelectedMachine}
        keyExtractor={(item) => item.id}
        labelExtractor={(item) => item.name}
      />

      <SelectInput 
        label="Select Movement"
        data={movements}
        selectedValue={selectedMovement}
        onSelect={setSelectedMovement}
        keyExtractor={(item) => item.id}
        labelExtractor={(item) => item.name || item.title || `Movement ${item.id}`}
      />

      {loadingCharges ? (
        <ActivityIndicator size="small" color="#007bff" style={{ marginVertical: 10 }} />
      ) : (
        <SelectInput 
          label="Select Charge"
          data={charges}
          selectedValue={selectedCharge}
          onSelect={setSelectedCharge}
          keyExtractor={(item) => item.id}
          labelExtractor={(item) => item.name || `Charge ${item.id}`}
        />
      )}

      <View style={styles.inputGroupRow}>
        <View style={styles.inputHalf}>
          <Text style={styles.label}>Sets *</Text>
          <TextInput
            style={styles.input}
            placeholder="Sets"
            value={sets}
            onChangeText={setSets}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputHalf}>
          <Text style={styles.label}>Reps *</Text>
          <TextInput
            style={styles.input}
            placeholder="Reps"
            value={reps}
            onChangeText={setReps}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Instructions (optional)</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Enter instructions"
          value={instructions}
          onChangeText={setInstructions}
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Add Exercise</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputGroupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputHalf: {
    width: '48%',
  },
  label: {
    marginBottom: 6,
    fontWeight: '600',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fafafa',
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  optionSelected: {
    backgroundColor: '#007bff',
  },
  optionText: {
    fontSize: 15,
    color: '#333',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noDataText: {
    padding: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
});

export default AddExerciseScreen;
