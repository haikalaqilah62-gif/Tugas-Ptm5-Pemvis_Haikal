import React, { useState, useEffect, useMemo, useCallback, useRef, useReducer } from 'react';
import { 
  StyleSheet, Text, View, TextInput, Button, FlatList, 
  TouchableOpacity, Alert 
} from 'react-native';

// --- INITIAL DATA (5 Data Tugas) ---
const initialTasks = [
  { id: '1', name: 'Tugas PTM 5', course: 'Pemrograman Visual', description: 'Membuat App Manajemen Tugas', deadline: '2026-11-10', status: 'Belum Dikerjakan' },
  { id: '2', name: 'Desain UI Vintage', course: 'Desain Grafis Multimedia', description: 'Layout Background Quiz Sejarah WW2', deadline: '2026-11-12', status: 'Selesai' },
  { id: '3', name: 'Kalkulasi Sinyal 5GHz', course: 'Jaringan Nirkabel', description: 'Hitung power dBm dan mW', deadline: '2026-11-08', status: 'Selesai' },
  { id: '4', name: 'Karakteristik Data Warehouse', course: 'Sistem Analisis', description: 'Perbedaan OLAP vs OLTP', deadline: '2026-11-15', status: 'Belum Dikerjakan' },
  { id: '5', name: 'Project Mikrokontroler', course: 'Sistem Tertanam', description: 'Coding Brankas Protection System', deadline: '2026-11-20', status: 'Belum Dikerjakan' }
];

// --- REDUCER ---
const taskReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TASK':
      return [action.payload, ...state];
    case 'DELETE_TASK':
      return state.filter(task => task.id !== action.payload);
    case 'TOGGLE_STATUS':
      return state.map(task => 
        task.id === action.payload 
          ? { ...task, status: task.status === 'Belum Dikerjakan' ? 'Selesai' : 'Belum Dikerjakan' } 
          : task
      );
    case 'RESET_TASKS':
      return [];
    default:
      return state;
  }
};

// --- KOMPONEN ANAK (Props) ---
const TaskCard = ({ task, onToggleStatus, onDelete }) => {
  const isDone = task.status === 'Selesai';
  
  return (
    <View style={[styles.card, isDone ? styles.cardDone : styles.cardTodo]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.title, isDone && styles.textStrike]}>{task.name}</Text>
        <Text style={styles.course}>{task.course}</Text>
      </View>
      <Text style={styles.desc}>{task.description}</Text>
      <Text style={styles.deadline}>Deadline: {task.deadline}</Text>
      <Text style={[styles.status, isDone ? styles.statusDoneText : styles.statusTodoText]}>
        Status: {task.status}
      </Text>
      
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={[styles.btn, isDone ? styles.btnUndo : styles.btnDone]} 
          onPress={() => onToggleStatus(task.id)}
        >
          <Text style={styles.btnText}>{isDone ? 'Batal Selesai' : 'Tandai Selesai'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnDelete]} onPress={() => onDelete(task.id)}>
          <Text style={styles.btnText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- KOMPONEN INDUK ---
export default function App() {
  // 1. useReducer: Mengelola state daftar tugas utama
  const [tasks, dispatch] = useReducer(taskReducer, initialTasks);

  // 2. useState: Form input & keyword pencarian
  const [taskName, setTaskName] = useState('');
  const [course, setCourse] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [keyword, setKeyword] = useState('');

  // 3. useRef: Referensi input nama tugas untuk auto-focus
  const nameInputRef = useRef(null);

  // 4. useEffect: Memantau keyword pencarian dan log ke console
  useEffect(() => {
    console.log(`Keyword pencarian berubah menjadi: "${keyword}"`);
  }, [keyword]);

  // 5. useCallback: Fungsi Add, Toggle, dan Delete agar direferensikan secara efisien
  const handleAddTask = useCallback(() => {
    if (!taskName || !course || !description || !deadline) {
      Alert.alert('Error', 'Semua form input wajib diisi!');
      return;
    }
    const newTask = {
      id: Date.now().toString(),
      name: taskName,
      course: course,
      description: description,
      deadline: deadline,
      status: 'Belum Dikerjakan'
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
    
    // Reset Form & arahkan fokus useRef ke input nama
    setTaskName('');
    setCourse('');
    setDescription('');
    setDeadline('');
    nameInputRef.current.focus(); 
  }, [taskName, course, description, deadline]);

  const handleToggleStatus = useCallback((id) => {
    dispatch({ type: 'TOGGLE_STATUS', payload: id });
  }, []);

  const handleDeleteTask = useCallback((id) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  }, []);

  // 6. useMemo: Fitur Filter dan Ringkasan Tugas
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => 
      task.name.toLowerCase().includes(keyword.toLowerCase()) || 
      task.course.toLowerCase().includes(keyword.toLowerCase())
    );
  }, [tasks, keyword]);

  const totalTasks = useMemo(() => tasks.length, [tasks]);
  const doneTasks = useMemo(() => tasks.filter(t => t.status === 'Selesai').length, [tasks]);
  const todoTasks = useMemo(() => tasks.filter(t => t.status === 'Belum Dikerjakan').length, [tasks]);

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Manajemen Tugas Mahasiswa</Text>
      
      {/* Ringkasan Tugas */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>Total: {totalTasks}</Text>
        <Text style={styles.summaryTextTodo}>Belum Selesai: {todoTasks}</Text>
        <Text style={styles.summaryTextDone}>Selesai: {doneTasks}</Text>
      </View>

      {/* Form Tambah Tugas */}
      <View style={styles.formContainer}>
        <TextInput 
          ref={nameInputRef} // useRef diterapkan disini
          style={styles.input} placeholder="Nama Tugas (Fokus ke sini saat ditambah)" 
          value={taskName} onChangeText={setTaskName} 
        />
        <TextInput style={styles.input} placeholder="Mata Kuliah" value={course} onChangeText={setCourse} />
        <TextInput style={styles.input} placeholder="Deskripsi Tugas" value={description} onChangeText={setDescription} />
        <TextInput style={styles.input} placeholder="Deadline (YYYY-MM-DD)" value={deadline} onChangeText={setDeadline} />
        <Button title="Tambah Tugas Baru" onPress={handleAddTask} color="#0056b3" />
      </View>

      {/* Pencarian Tugas */}
      <TextInput 
        style={styles.searchInput} 
        placeholder="Cari tugas berdasarkan Nama / Mata Kuliah..." 
        value={keyword} 
        onChangeText={setKeyword} 
      />

      {/* Daftar Tugas (FlatList) */}
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TaskCard 
            task={item} 
            onToggleStatus={handleToggleStatus} 
            onDelete={handleDeleteTask} 
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Data tugas tidak ditemukan.</Text>}
      />
    </View>
  );
}

// --- STYLING ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 15, color: '#333' },
  
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, padding: 10, backgroundColor: '#fff', borderRadius: 8, elevation: 2 },
  summaryText: { fontWeight: 'bold', color: '#555' },
  summaryTextTodo: { fontWeight: 'bold', color: '#e74c3c' },
  summaryTextDone: { fontWeight: 'bold', color: '#2ecc71' },

  formContainer: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, elevation: 2 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginBottom: 10, backgroundColor: '#fafafa' },
  searchInput: { borderWidth: 1, borderColor: '#0056b3', borderRadius: 6, padding: 10, marginBottom: 15, backgroundColor: '#eef6ff', fontWeight: 'bold' },

  card: { padding: 15, borderRadius: 8, marginBottom: 12, elevation: 3, borderWidth: 1 },
  cardTodo: { backgroundColor: '#fff', borderColor: '#e74c3c' },
  cardDone: { backgroundColor: '#e9f7ef', borderColor: '#2ecc71', opacity: 0.8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', flex: 1 },
  textStrike: { textDecorationLine: 'line-through', color: '#7f8c8d' },
  course: { fontSize: 12, color: '#34495e', fontStyle: 'italic' },
  desc: { fontSize: 13, color: '#555', marginBottom: 5 },
  deadline: { fontSize: 12, color: '#888', fontWeight: 'bold', marginBottom: 5 },
  status: { fontSize: 13, fontWeight: 'bold', marginBottom: 10 },
  statusTodoText: { color: '#e74c3c' },
  statusDoneText: { color: '#27ae60' },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { padding: 8, borderRadius: 5, width: '48%', alignItems: 'center' },
  btnDone: { backgroundColor: '#2ecc71' },
  btnUndo: { backgroundColor: '#f39c12' },
  btnDelete: { backgroundColor: '#e74c3c' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  emptyText: { textAlign: 'center', marginTop: 20, color: '#7f8c8d', fontStyle: 'italic' }
});