-- ============================================================
-- SERVA Cotizaciones — Seed inicial
-- Ejecuta DESPUÉS de schema.sql para cargar datos de ejemplo
-- ============================================================

insert into cotizaciones (
  id, numero_cotizacion, nombre_servicio, cliente, proveedor, monto,
  fecha_solicitud, fecha_envio, fecha_cierre_estimada, responsable, estado,
  proxima_accion, notas, enlace_sheets, categoria, prioridad,
  probabilidad_cierre, motivo_rechazo, creado_en, actualizado_en
) values
  ('1','COT-2024-001','Limpieza General de Oficinas','Corporativo Alfa S.A. de C.V.','CleanPro México',45000,
   '2024-01-10','2024-01-12','','Diego Rodríguez','aprobada',
   'Coordinar inicio de servicios','Cliente solicita servicio mensual recurrente. Frecuencia: 3 veces por semana.',
   'https://docs.google.com/spreadsheets/d/ejemplo1','Limpieza General','Alta',
   100,'','2024-01-10T09:00:00Z','2024-01-20T14:00:00Z'),

  ('2','COT-2024-002','Mantenimiento Preventivo HVAC','Hospital Médico Central','TecnoClima Industrial',128500,
   '2024-01-15','2024-01-18','','Patricio Blanco','enviada',
   'Llamar al director de mantenimiento el lunes','Requiere acceso a áreas restringidas. Coordinar con seguridad.',
   'https://docs.google.com/spreadsheets/d/ejemplo2','Instalación','Alta',
   75,'','2024-01-15T10:30:00Z','2024-01-18T16:00:00Z'),

  ('3','COT-2024-003','Servicio de Seguridad Perimetral','Bodega Industrial Norte','SecureGuard México',89000,
   '2024-01-20','','','Diego Rodríguez','pendiente',
   'Visita a sitio para levantamiento el miércoles','Necesitan 4 guardias 24/7. Incluir propuesta de cámaras.',
   '','Instalación','Alta',
   60,'','2024-01-20T08:00:00Z','2024-01-20T08:00:00Z'),

  ('4','COT-2024-004','Jardinería y Mantenimiento de Áreas Verdes','Residencial Las Palmas','Verde Naturaleza',32000,
   '2024-01-08','2024-01-09','','Patricio Blanco','rechazada',
   'Archivar. Posible seguimiento en Q2.','El cliente eligió un proveedor local con menor precio.',
   'https://docs.google.com/spreadsheets/d/ejemplo4','Limpieza General','Baja',
   0,'Precio elevado vs. competencia local','2024-01-08T11:00:00Z','2024-01-22T09:00:00Z'),

  ('5','COT-2024-005','Fumigación y Control de Plagas','Restaurante El Buen Sabor','EcoControl Plagas',15500,
   '2024-01-22','2024-01-23','','Diego Rodríguez','enviada',
   'Confirmar fecha de aplicación con encargado','Servicio urgente por requisito de certificación sanitaria.',
   'https://docs.google.com/spreadsheets/d/ejemplo5','Fumigación','Alta',
   90,'','2024-01-22T14:00:00Z','2024-01-23T10:00:00Z'),

  ('6','COT-2024-006','Instalación Eléctrica Industrial','Planta Manufacturera Beta','ElectroSoluciones MX',215000,
   '2024-01-25','','','Patricio Blanco','pendiente',
   'Solicitar planos eléctricos al cliente','Proyecto en 2 fases. Fase 1: subestación. Fase 2: distribución.',
   '','Eléctrico','Alta',
   50,'','2024-01-25T09:30:00Z','2024-01-25T09:30:00Z'),

  ('7','COT-2024-007','Pintura Exterior de Edificio','Torre Empresarial Sur','PintaMex Profesional',67000,
   '2024-01-18','2024-01-21','','Diego Rodríguez','aprobada',
   'Coordinar inicio de obra','Color RAL 9003. Incluye andamios y equipo de seguridad.',
   'https://docs.google.com/spreadsheets/d/ejemplo7','Limpieza Profunda','Media',
   100,'','2024-01-18T10:00:00Z','2024-01-28T15:00:00Z'),

  ('8','COT-2024-008','Plomería y Reparación de Red Hidráulica','Centro Comercial Estrella','HidroExpert',38500,
   '2024-01-28','2024-01-29','','Diego Rodríguez','enviada',
   'Seguimiento por WhatsApp al gerente de operaciones','Fuga detectada en nivel -2. Trabajo nocturno requerido.',
   'https://docs.google.com/spreadsheets/d/ejemplo8','Plomería','Alta',
   80,'','2024-01-28T16:00:00Z','2024-01-29T11:00:00Z'),

  ('9','COT-2024-009','Limpieza de Tanques de Agua','Condominio Las Torres','CleanPro México',12000,
   '2024-01-30','','','Patricio Blanco','pendiente',
   'Enviar cotización esta semana','4 cisternas de 10,000 litros cada una.',
   '','Limpieza General','Media',
   70,'','2024-01-30T09:00:00Z','2024-01-30T09:00:00Z'),

  ('10','COT-2024-010','Consultoría en Gestión de Facilities','Grupo Empresarial Omega','SERVA Consulting',95000,
   '2024-01-05','2024-01-07','','Diego Rodríguez','rechazada',
   'Revisar propuesta mejorada para Q2','Presupuesto aprobado fue 30% menor. Considerar propuesta reducida.',
   'https://docs.google.com/spreadsheets/d/ejemplo10','Instalación','Media',
   0,'Presupuesto insuficiente del cliente','2024-01-05T10:00:00Z','2024-01-26T12:00:00Z')

on conflict (id) do nothing;
