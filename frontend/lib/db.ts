import { supabase } from './supabase';

// ── CASOS ──────────────────────────────────────────────
export async function getCasos() {
  const { data, error } = await supabase
    .from('casos')
    .select('*')
    .order('id', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getCasoById(id: number) {
  const { data, error } = await supabase
    .from('casos')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function crearCaso(payload: { solicitante: string; convocado: string; pretension: string }) {
  const { data, error } = await supabase
    .from('casos')
    .insert({ ...payload, estado: 'INICIADO', fecha_radicacion: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function cambiarEstadoCaso(id: number, estado: 'INICIADO' | 'EN_PROCESO' | 'FINALIZADO') {
  const { data, error } = await supabase
    .from('casos')
    .update({ estado })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function eliminarCaso(id: number) {
  const { error } = await supabase.from('casos').delete().eq('id', id);
  if (error) throw error;
}

// ── EVENTOS ────────────────────────────────────────────
export async function getEventos() {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .order('date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function crearEvento(payload: { title: string; date: string; type: string }) {
  const { data, error } = await supabase
    .from('eventos')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function eliminarEvento(id: string) {
  const { error } = await supabase.from('eventos').delete().eq('id', id);
  if (error) throw error;
}

// ── DOCUMENTOS ─────────────────────────────────────────
export async function getDocumentos(casoId?: number) {
  let query = supabase
    .from('documentos')
    .select('*')
    .order('uploaded_at', { ascending: false });
  if (casoId) query = query.eq('caso_id', casoId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((d: any) => ({
    id: d.id,
    casoId: d.caso_id,
    name: d.name,
    type: d.type,
    size: d.size,
    uploadedBy: d.uploaded_by,
    uploadedAt: d.uploaded_at,
  }));
}

export async function crearDocumento(payload: {
  name: string; type: string; size: number;
  uploadedBy: string; uploadedAt: string; casoId: number;
}) {
  const { data, error } = await supabase
    .from('documentos')
    .insert({
      name: payload.name,
      type: payload.type,
      size: payload.size,
      uploaded_by: payload.uploadedBy,
      uploaded_at: payload.uploadedAt,
      caso_id: payload.casoId,
    })
    .select()
    .single();
  if (error) throw error;
  return { ...data, uploadedBy: data.uploaded_by, uploadedAt: data.uploaded_at, casoId: data.caso_id };
}

export async function eliminarDocumento(id: string) {
  const { error } = await supabase.from('documentos').delete().eq('id', id);
  if (error) throw error;
}

// ── FACTURAS ───────────────────────────────────────────
export async function getFacturas() {
  const { data, error } = await supabase
    .from('facturas')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function crearFactura(payload: {
  number: string; client: string; concept: string;
  date: string; amount: string; status: string;
}) {
  const { data, error } = await supabase
    .from('facturas')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── INGRESOS ───────────────────────────────────────────
export async function getIngresos() {
  const { data, error } = await supabase
    .from('ingresos')
    .select('*')
    .order('payment_date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((i: any) => ({
    id: i.id,
    caseId: i.case_id,
    caseType: i.case_type,
    amount: i.amount,
    paymentDate: i.payment_date,
    description: i.description,
    status: i.status,
  }));
}

export async function crearIngreso(payload: {
  caseId: string; caseType: string; amount: string;
  paymentDate: string; description: string; status: string;
}) {
  const { data, error } = await supabase
    .from('ingresos')
    .insert({
      case_id: payload.caseId,
      case_type: payload.caseType,
      amount: payload.amount,
      payment_date: payload.paymentDate,
      description: payload.description,
      status: payload.status,
    })
    .select()
    .single();
  if (error) throw error;
  return { ...data, caseId: data.case_id, caseType: data.case_type, paymentDate: data.payment_date };
}

export async function eliminarIngreso(id: string) {
  const { error } = await supabase.from('ingresos').delete().eq('id', id);
  if (error) throw error;
}
