import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GREEN = '#176b5b';
const money = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [kind, setKind] = useState('in');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today());
  const [tab, setTab] = useState('Kas');
  const [members, setMembers] = useState([]);
  const [memberName, setMemberName] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { (async () => { try { const a = await AsyncStorage.getItem('kaskita-transactions-v1'); const b = await AsyncStorage.getItem('kaskita-members-v1'); if (a) setTransactions(JSON.parse(a)); if (b) setMembers(JSON.parse(b)); } catch(e) {} setLoaded(true); })(); }, []);
  useEffect(() => { if (loaded) AsyncStorage.setItem('kaskita-transactions-v1', JSON.stringify(transactions)).catch(()=>{}); }, [transactions, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('kaskita-members-v1', JSON.stringify(members)).catch(()=>{}); }, [members, loaded]);

  const totalIn = useMemo(() => transactions.filter(t=>t.kind==='in').reduce((s,t)=>s+t.amount,0), [transactions]);
  const totalOut = useMemo(() => transactions.filter(t=>t.kind==='out').reduce((s,t)=>s+t.amount,0), [transactions]);
  const addTransaction = () => {
    const n = Number(amount);
    if (!desc.trim() || !Number.isSafeInteger(n) || n < 1 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) { Alert.alert('Periksa data', 'Isi keterangan, nominal angka yang benar, dan tanggal format YYYY-MM-DD.'); return; }
    setTransactions(prev => [{ id: `${Date.now()}`, kind, desc: desc.trim(), amount: n, date }, ...prev]); setDesc(''); setAmount(''); setDate(today()); Alert.alert('Berhasil', 'Transaksi tersimpan di perangkat ini.');
  };
  const deleteTransaction = id => Alert.alert('Hapus transaksi?', 'Catatan ini akan dihapus dari perangkat.', [{text:'Batal',style:'cancel'},{text:'Hapus',style:'destructive',onPress:()=>setTransactions(p=>p.filter(t=>t.id!==id))}]);
  const addMember = () => { if (!memberName.trim()) return; setMembers(p=>[...p,{id:`${Date.now()}`,name:memberName.trim(),paid:false}]); setMemberName(''); };
  const togglePaid = id => setMembers(p=>p.map(m=>m.id===id?{...m,paid:!m.paid}:m));
  const Card = ({label,value,color}) => <View style={styles.card}><Text style={styles.muted}>{label}</Text><Text style={[styles.amount,{color:color||'#172b25'}]}>{money(value)}</Text></View>;
  const Button = ({title,onPress,active}) => <TouchableOpacity onPress={onPress} style={[styles.button,active&&styles.buttonActive]}><Text style={[styles.buttonText,active&&{color:'#fff'}]}>{title}</Text></TouchableOpacity>;

  return <SafeAreaView style={styles.safe}><StatusBar barStyle="dark-content" backgroundColor="#f4f8f5"/><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <View style={styles.header}><View style={styles.logo}><Text style={{color:'#fff',fontSize:22,fontWeight:'900'}}>₊</Text></View><View style={{flex:1}}><Text style={styles.title}>KasKita</Text><Text style={styles.subtitle}>Catatan kas kelas jadi lebih rapi.</Text></View><View style={styles.pill}><Text style={styles.pillText}>Versi awal</Text></View></View>
      <Text style={styles.heading}>Ringkasan kas</Text><Text style={styles.muted}>Pantau uang masuk dan keluar kelas dalam satu tempat.</Text>
      <View style={styles.summary}><Card label="Saldo saat ini" value={totalIn-totalOut}/><Card label="Total pemasukan" value={totalIn} color="#16815c"/><Card label="Total pengeluaran" value={totalOut} color="#c24d45"/></View>
      <View style={styles.tabs}><Button title="Transaksi" active={tab==='Kas'} onPress={()=>setTab('Kas')}/><Button title="Kas mingguan" active={tab==='Mingguan'} onPress={()=>setTab('Mingguan')}/></View>
      {tab==='Kas' ? <>
        <View style={styles.panel}><Text style={styles.heading}>Tambah transaksi</Text><Text style={styles.muted}>Nominal cukup diisi satu kali.</Text><View style={styles.row}><Button title="＋ Pemasukan" active={kind==='in'} onPress={()=>setKind('in')}/><Button title="− Pengeluaran" active={kind==='out'} onPress={()=>setKind('out')}/></View>
          <Text style={styles.label}>Keterangan</Text><TextInput value={desc} onChangeText={setDesc} placeholder="Contoh: Iuran kas mingguan" maxLength={90} style={styles.input}/>
          <Text style={styles.label}>Nominal (rupiah)</Text><TextInput value={amount} onChangeText={setAmount} keyboardType="number-pad" placeholder="Contoh: 10000" style={styles.input}/>
          <Text style={styles.label}>Tanggal (YYYY-MM-DD)</Text><TextInput value={date} onChangeText={setDate} placeholder="2026-10-28" style={styles.input}/>
          <TouchableOpacity style={styles.primary} onPress={addTransaction}><Text style={styles.primaryText}>＋ Simpan transaksi</Text></TouchableOpacity>
        </View>
        <View style={styles.panel}><Text style={styles.heading}>Riwayat transaksi</Text><Text style={styles.muted}>{transactions.length} transaksi tersimpan</Text>
          {transactions.length===0 ? <Text style={styles.empty}>Belum ada transaksi. Tambahkan catatan pertama di atas.</Text> : transactions.map(t=><View key={t.id} style={styles.transaction}><View style={{flex:1}}><Text style={styles.txTitle}>{t.desc}</Text><Text style={styles.muted}>{t.date} · {t.kind==='in'?'Pemasukan':'Pengeluaran'}</Text></View><View style={{alignItems:'flex-end'}}><Text style={{fontWeight:'800',color:t.kind==='in'?'#16815c':'#c24d45'}}>{t.kind==='in'?'+':'−'}{money(t.amount)}</Text><TouchableOpacity onPress={()=>deleteTransaction(t.id)}><Text style={styles.delete}>Hapus</Text></TouchableOpacity></View></View>)}
        </View>
      </> : <View style={styles.panel}><Text style={styles.heading}>Kas mingguan</Text><Text style={styles.muted}>Tambahkan nama anggota dan tandai pembayaran minggu ini.</Text><Text style={styles.label}>Nama anggota</Text><TextInput value={memberName} onChangeText={setMemberName} placeholder="Contoh: Andi" style={styles.input}/><TouchableOpacity style={styles.primary} onPress={addMember}><Text style={styles.primaryText}>＋ Tambah anggota</Text></TouchableOpacity>
        <View style={styles.duesSummary}><Text style={styles.txTitle}>Sudah bayar: {members.filter(m=>m.paid).length}</Text><Text style={styles.txTitle}>Belum bayar: {members.filter(m=>!m.paid).length}</Text></View>
        {members.length===0?<Text style={styles.empty}>Belum ada anggota. Tambahkan nama anggota di atas.</Text>:members.map(m=><TouchableOpacity key={m.id} style={styles.member} onPress={()=>togglePaid(m.id)}><Text style={{flex:1,color:'#172b25',fontWeight:'650'}}>{m.name}</Text><Text style={[styles.status,{backgroundColor:m.paid?'#dff5e9':'#fff0df',color:m.paid?'#176b4c':'#8a5a13'}]}>{m.paid?'Sudah bayar ✓':'Belum bayar · tekan'}</Text></TouchableOpacity>)}
      </View>}
      <Text style={styles.footnote}>Versi awal menyimpan data di HP ini. Akun bendahara/ketua kelas, sinkronisasi online, dan ekspor/impor CSV belum aktif dan perlu ditambahkan sebelum digunakan bersama.</Text>
    </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}

const styles = StyleSheet.create({safe:{flex:1,backgroundColor:'#f4f8f5'},page:{padding:16,paddingBottom:32},header:{flexDirection:'row',alignItems:'center',gap:11,marginBottom:25},logo:{width:46,height:46,borderRadius:15,backgroundColor:GREEN,alignItems:'center',justifyContent:'center'},title:{fontSize:25,fontWeight:'900',color:'#172b25'},subtitle:{fontSize:12,color:'#62736b',marginTop:2},pill:{backgroundColor:'#e0f2e9',paddingVertical:8,paddingHorizontal:10,borderRadius:30},pillText:{color:'#163f35',fontWeight:'700',fontSize:11},heading:{fontSize:19,fontWeight:'850',color:'#172b25',marginBottom:5},muted:{fontSize:12,color:'#718078',lineHeight:18},summary:{gap:10,marginTop:15,marginBottom:18},card:{backgroundColor:'#fff',borderWidth:1,borderColor:'#e2ebe5',borderRadius:18,padding:16},amount:{fontSize:22,fontWeight:'900',marginTop:8},tabs:{flexDirection:'row',gap:9,marginBottom:14},button:{borderRadius:11,paddingVertical:10,paddingHorizontal:13,backgroundColor:'#e0f2e9',alignItems:'center',justifyContent:'center',flex:1},buttonActive:{backgroundColor:GREEN},buttonText:{fontWeight:'750',fontSize:12,color:'#163f35'},panel:{backgroundColor:'#fff',borderWidth:1,borderColor:'#e2ebe5',borderRadius:18,padding:16,marginBottom:14},row:{flexDirection:'row',gap:9,marginTop:14,marginBottom:8},label:{fontWeight:'700',fontSize:12,color:'#34463d',marginTop:12,marginBottom:6},input:{borderWidth:1,borderColor:'#d6e2da',backgroundColor:'#fff',borderRadius:11,paddingHorizontal:12,paddingVertical:11,color:'#172b25',fontSize:14},primary:{backgroundColor:GREEN,borderRadius:12,padding:13,alignItems:'center',marginTop:14},primaryText:{color:'#fff',fontWeight:'800'},empty:{textAlign:'center',paddingVertical:25,color:'#718078',fontSize:13,lineHeight:20},transaction:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:13,borderBottomWidth:1,borderBottomColor:'#e6eee8'},txTitle:{fontSize:14,fontWeight:'750',color:'#172b25',marginBottom:4},delete:{fontSize:11,color:'#c24d45',marginTop:5,fontWeight:'700'},duesSummary:{flexDirection:'row',justifyContent:'space-between',backgroundColor:'#f4f8f5',padding:12,borderRadius:11,marginTop:14,marginBottom:6},member:{flexDirection:'row',alignItems:'center',gap:8,paddingVertical:13,borderBottomWidth:1,borderBottomColor:'#e6eee8'},status:{fontSize:10,fontWeight:'800',paddingHorizontal:9,paddingVertical:7,borderRadius:20,overflow:'hidden'},footnote:{fontSize:11,color:'#718078',lineHeight:17,marginTop:4,paddingHorizontal:2}});
