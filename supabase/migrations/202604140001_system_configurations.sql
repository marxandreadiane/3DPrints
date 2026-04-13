create table if not exists system_configurations (
    id integer primary key default 1 check (id = 1),
    base_cost_rate numeric not null default 14.16,
    printer_kwh_per_hour numeric not null default 0.2,
    power_surge_kwh numeric not null default 1.3,
    hourly_labor_rate numeric not null default 250,
    filament_change_cost numeric not null default 0.1,
    sanding_cost numeric not null default 500,
    painting_cost numeric not null default 800,
    assembly_cost numeric not null default 350,
    failure_rate_percent numeric not null default 10,
    markup_percent numeric not null default 30,
    wear_tear_cost_per_15_min numeric not null default 2.5,
    updated_at timestamptz not null default timezone('utc'::text, now())
);

insert into system_configurations (
    id,
    base_cost_rate,
    printer_kwh_per_hour,
    power_surge_kwh,
    hourly_labor_rate,
    filament_change_cost,
    sanding_cost,
    painting_cost,
    assembly_cost,
    failure_rate_percent,
    markup_percent,
    wear_tear_cost_per_15_min
)
values (
    1,
    14.16,
    0.2,
    1.3,
    250,
    0.1,
    500,
    800,
    350,
    10,
    30,
    2.5
)
on conflict (id) do nothing;

alter table system_configurations enable row level security;

create policy "system_configurations_select_all"
on system_configurations
for select
to anon, authenticated
using (true);

create policy "system_configurations_insert_all"
on system_configurations
for insert
to anon, authenticated
with check (true);

create policy "system_configurations_update_all"
on system_configurations
for update
to anon, authenticated
using (true)
with check (true);
