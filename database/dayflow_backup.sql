--
-- PostgreSQL database dump
--

\restrict QgjyB9SCBbmLWpshLffN1AlNYTxspAa61tGnaKeWmkVJzbLL31QduarKaaDFCZN

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.salary_structures DROP CONSTRAINT IF EXISTS salary_structures_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payrolls DROP CONSTRAINT IF EXISTS payrolls_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.leaves DROP CONSTRAINT IF EXISTS leaves_reviewed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.leaves DROP CONSTRAINT IF EXISTS leaves_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_designation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.designations DROP CONSTRAINT IF EXISTS designations_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attendances DROP CONSTRAINT IF EXISTS attendances_employee_id_fkey;
DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS trg_salary_structures_updated_at ON public.salary_structures;
DROP TRIGGER IF EXISTS trg_payrolls_updated_at ON public.payrolls;
DROP TRIGGER IF EXISTS trg_leaves_updated_at ON public.leaves;
DROP TRIGGER IF EXISTS trg_employees_updated_at ON public.employees;
DROP TRIGGER IF EXISTS trg_designations_updated_at ON public.designations;
DROP TRIGGER IF EXISTS trg_departments_updated_at ON public.departments;
DROP TRIGGER IF EXISTS trg_attendances_updated_at ON public.attendances;
DROP INDEX IF EXISTS public.idx_users_role;
DROP INDEX IF EXISTS public.idx_users_email;
DROP INDEX IF EXISTS public.idx_payrolls_status;
DROP INDEX IF EXISTS public.idx_payrolls_employee_period;
DROP INDEX IF EXISTS public.idx_notifications_user_unread;
DROP INDEX IF EXISTS public.idx_notifications_created_at;
DROP INDEX IF EXISTS public.idx_leaves_type;
DROP INDEX IF EXISTS public.idx_leaves_status;
DROP INDEX IF EXISTS public.idx_leaves_employee_id;
DROP INDEX IF EXISTS public.idx_leaves_dates;
DROP INDEX IF EXISTS public.idx_employees_user_id;
DROP INDEX IF EXISTS public.idx_employees_designation;
DROP INDEX IF EXISTS public.idx_employees_department;
DROP INDEX IF EXISTS public.idx_employees_code;
DROP INDEX IF EXISTS public.idx_documents_employee_id;
DROP INDEX IF EXISTS public.idx_audit_logs_user_action;
DROP INDEX IF EXISTS public.idx_audit_logs_created_at;
DROP INDEX IF EXISTS public.idx_attendances_status_date;
DROP INDEX IF EXISTS public.idx_attendances_status;
DROP INDEX IF EXISTS public.idx_attendances_employee_date;
DROP INDEX IF EXISTS public.idx_attendances_date_range;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.payrolls DROP CONSTRAINT IF EXISTS uq_employee_payroll_month_year;
ALTER TABLE IF EXISTS ONLY public.attendances DROP CONSTRAINT IF EXISTS uq_employee_attendance_date;
ALTER TABLE IF EXISTS ONLY public.designations DROP CONSTRAINT IF EXISTS uq_department_designation;
ALTER TABLE IF EXISTS ONLY public.salary_structures DROP CONSTRAINT IF EXISTS salary_structures_pkey;
ALTER TABLE IF EXISTS ONLY public.salary_structures DROP CONSTRAINT IF EXISTS salary_structures_employee_id_key;
ALTER TABLE IF EXISTS ONLY public.payrolls DROP CONSTRAINT IF EXISTS payrolls_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.leaves DROP CONSTRAINT IF EXISTS leaves_pkey;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_user_id_key;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_pkey;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_employee_code_key;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_pkey;
ALTER TABLE IF EXISTS ONLY public.designations DROP CONSTRAINT IF EXISTS designations_pkey;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS departments_pkey;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS departments_name_key;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.attendances DROP CONSTRAINT IF EXISTS attendances_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.salary_structures ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.payrolls ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.leaves ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.employees ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.documents ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.designations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.departments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.audit_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.attendances ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.salary_structures_id_seq;
DROP TABLE IF EXISTS public.salary_structures;
DROP SEQUENCE IF EXISTS public.payrolls_id_seq;
DROP TABLE IF EXISTS public.payrolls;
DROP SEQUENCE IF EXISTS public.notifications_id_seq;
DROP TABLE IF EXISTS public.notifications;
DROP SEQUENCE IF EXISTS public.leaves_id_seq;
DROP TABLE IF EXISTS public.leaves;
DROP SEQUENCE IF EXISTS public.employees_id_seq;
DROP TABLE IF EXISTS public.employees;
DROP SEQUENCE IF EXISTS public.documents_id_seq;
DROP TABLE IF EXISTS public.documents;
DROP SEQUENCE IF EXISTS public.designations_id_seq;
DROP TABLE IF EXISTS public.designations;
DROP SEQUENCE IF EXISTS public.departments_id_seq;
DROP TABLE IF EXISTS public.departments;
DROP SEQUENCE IF EXISTS public.audit_logs_id_seq;
DROP TABLE IF EXISTS public.audit_logs;
DROP SEQUENCE IF EXISTS public.attendances_id_seq;
DROP TABLE IF EXISTS public.attendances;
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP EXTENSION IF EXISTS pgcrypto;
--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attendances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendances (
    id bigint NOT NULL,
    employee_id bigint NOT NULL,
    date date NOT NULL,
    check_in timestamp with time zone,
    check_out timestamp with time zone,
    working_hours numeric(4,2),
    status character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT attendances_status_check CHECK (((status)::text = ANY ((ARRAY['PRESENT'::character varying, 'ABSENT'::character varying, 'HALF_DAY'::character varying, 'LEAVE'::character varying])::text[]))),
    CONSTRAINT attendances_working_hours_check CHECK ((working_hours >= (0)::numeric))
);


--
-- Name: attendances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.attendances_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: attendances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.attendances_id_seq OWNED BY public.attendances.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    user_id bigint,
    action character varying(50) NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id character varying(50),
    details jsonb,
    ip_address character varying(45),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: designations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.designations (
    id integer NOT NULL,
    department_id integer,
    title character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: designations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.designations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: designations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.designations_id_seq OWNED BY public.designations.id;


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id bigint NOT NULL,
    employee_id bigint NOT NULL,
    document_name character varying(255) NOT NULL,
    document_type character varying(50) NOT NULL,
    document_url text NOT NULL,
    uploaded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.documents_id_seq OWNED BY public.documents.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    employee_code character varying(30) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    gender character varying(20),
    date_of_birth date,
    phone character varying(30),
    address text,
    department_id integer,
    designation_id integer,
    joining_date date NOT NULL,
    profile_picture_url text,
    employment_status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT employees_employment_status_check CHECK (((employment_status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'PROBATION'::character varying, 'RESIGNED'::character varying, 'TERMINATED'::character varying])::text[]))),
    CONSTRAINT employees_gender_check CHECK (((gender)::text = ANY ((ARRAY['MALE'::character varying, 'FEMALE'::character varying, 'OTHER'::character varying, 'PREFER_NOT_TO_SAY'::character varying])::text[])))
);


--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employees_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: leaves; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leaves (
    id bigint NOT NULL,
    employee_id bigint NOT NULL,
    leave_type character varying(20) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    reason text NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    reviewed_by bigint,
    reviewer_comment text,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_leave_dates CHECK ((end_date >= start_date)),
    CONSTRAINT leaves_leave_type_check CHECK (((leave_type)::text = ANY ((ARRAY['PAID'::character varying, 'SICK'::character varying, 'UNPAID'::character varying])::text[]))),
    CONSTRAINT leaves_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying])::text[])))
);


--
-- Name: leaves_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leaves_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leaves_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leaves_id_seq OWNED BY public.leaves.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: payrolls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payrolls (
    id bigint NOT NULL,
    employee_id bigint NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    basic_salary numeric(12,2) NOT NULL,
    hra numeric(12,2) DEFAULT 0.00 NOT NULL,
    allowances numeric(12,2) DEFAULT 0.00 NOT NULL,
    deductions numeric(12,2) DEFAULT 0.00 NOT NULL,
    net_salary numeric(12,2) NOT NULL,
    payment_status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    payment_date date,
    remarks text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT payrolls_allowances_check CHECK ((allowances >= (0)::numeric)),
    CONSTRAINT payrolls_basic_salary_check CHECK ((basic_salary >= (0)::numeric)),
    CONSTRAINT payrolls_deductions_check CHECK ((deductions >= (0)::numeric)),
    CONSTRAINT payrolls_hra_check CHECK ((hra >= (0)::numeric)),
    CONSTRAINT payrolls_month_check CHECK (((month >= 1) AND (month <= 12))),
    CONSTRAINT payrolls_net_salary_check CHECK ((net_salary >= (0)::numeric)),
    CONSTRAINT payrolls_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['PENDING'::character varying, 'PROCESSED'::character varying, 'PAID'::character varying, 'FAILED'::character varying])::text[]))),
    CONSTRAINT payrolls_year_check CHECK ((year >= 2000))
);


--
-- Name: payrolls_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payrolls_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payrolls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payrolls_id_seq OWNED BY public.payrolls.id;


--
-- Name: salary_structures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.salary_structures (
    id bigint NOT NULL,
    employee_id bigint NOT NULL,
    basic_salary numeric(12,2) NOT NULL,
    hra numeric(12,2) DEFAULT 0.00 NOT NULL,
    allowances numeric(12,2) DEFAULT 0.00 NOT NULL,
    deductions numeric(12,2) DEFAULT 0.00 NOT NULL,
    net_salary numeric(12,2) NOT NULL,
    currency character varying(10) DEFAULT 'INR'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT salary_structures_allowances_check CHECK ((allowances >= (0)::numeric)),
    CONSTRAINT salary_structures_basic_salary_check CHECK ((basic_salary >= (0)::numeric)),
    CONSTRAINT salary_structures_deductions_check CHECK ((deductions >= (0)::numeric)),
    CONSTRAINT salary_structures_hra_check CHECK ((hra >= (0)::numeric)),
    CONSTRAINT salary_structures_net_salary_check CHECK ((net_salary >= (0)::numeric))
);


--
-- Name: salary_structures_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.salary_structures_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: salary_structures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.salary_structures_id_seq OWNED BY public.salary_structures.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    is_verified boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['ADMIN'::character varying, 'HR'::character varying, 'EMPLOYEE'::character varying])::text[])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: attendances id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances ALTER COLUMN id SET DEFAULT nextval('public.attendances_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: designations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designations ALTER COLUMN id SET DEFAULT nextval('public.designations_id_seq'::regclass);


--
-- Name: documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents ALTER COLUMN id SET DEFAULT nextval('public.documents_id_seq'::regclass);


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: leaves id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaves ALTER COLUMN id SET DEFAULT nextval('public.leaves_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: payrolls id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payrolls ALTER COLUMN id SET DEFAULT nextval('public.payrolls_id_seq'::regclass);


--
-- Name: salary_structures id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salary_structures ALTER COLUMN id SET DEFAULT nextval('public.salary_structures_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: attendances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attendances (id, employee_id, date, check_in, check_out, working_hours, status, created_at, updated_at) FROM stdin;
1	3	2026-07-15	2026-07-15 09:15:00+05:30	2026-07-15 13:45:00+05:30	4.50	HALF_DAY	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
2	3	2026-07-16	2026-07-16 09:05:00+05:30	2026-07-16 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
3	3	2026-07-17	2026-07-17 10:15:00+05:30	2026-07-17 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
4	3	2026-07-20	2026-07-20 09:05:00+05:30	2026-07-20 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
5	3	2026-07-21	2026-07-21 09:05:00+05:30	2026-07-21 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
6	3	2026-07-22	2026-07-22 09:05:00+05:30	2026-07-22 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
7	3	2026-07-23	2026-07-23 09:05:00+05:30	2026-07-23 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
8	3	2026-07-24	2026-07-24 10:15:00+05:30	2026-07-24 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
9	3	2026-07-27	2026-07-27 09:05:00+05:30	2026-07-27 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
10	3	2026-07-28	2026-07-28 09:15:00+05:30	2026-07-28 13:45:00+05:30	4.50	HALF_DAY	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
11	3	2026-07-29	2026-07-29 09:05:00+05:30	2026-07-29 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
12	3	2026-07-30	2026-07-30 09:15:00+05:30	2026-07-30 13:45:00+05:30	4.50	HALF_DAY	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
13	3	2026-07-31	2026-07-31 09:05:00+05:30	2026-07-31 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
14	3	2026-08-03	2026-08-03 09:15:00+05:30	2026-08-03 13:45:00+05:30	4.50	HALF_DAY	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
15	3	2026-08-04	2026-08-04 10:15:00+05:30	2026-08-04 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
16	3	2026-08-05	2026-08-05 09:05:00+05:30	2026-08-05 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
17	3	2026-08-06	2026-08-06 09:05:00+05:30	2026-08-06 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
18	3	2026-08-07	2026-08-07 10:15:00+05:30	2026-08-07 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
19	3	2026-08-10	2026-08-10 09:05:00+05:30	2026-08-10 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
20	3	2026-08-11	2026-08-11 10:15:00+05:30	2026-08-11 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
21	3	2026-08-12	2026-08-12 10:15:00+05:30	2026-08-12 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
22	3	2026-08-13	2026-08-13 09:05:00+05:30	2026-08-13 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
23	4	2026-07-15	2026-07-15 09:05:00+05:30	2026-07-15 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
24	4	2026-07-16	2026-07-16 09:05:00+05:30	2026-07-16 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
25	4	2026-07-17	2026-07-17 10:15:00+05:30	2026-07-17 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
26	4	2026-07-20	2026-07-20 09:05:00+05:30	2026-07-20 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
27	4	2026-07-21	2026-07-21 09:05:00+05:30	2026-07-21 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
28	4	2026-07-22	\N	\N	0.00	LEAVE	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
29	4	2026-07-23	2026-07-23 09:05:00+05:30	2026-07-23 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
30	4	2026-07-24	2026-07-24 09:05:00+05:30	2026-07-24 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
31	4	2026-07-27	2026-07-27 09:05:00+05:30	2026-07-27 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
32	4	2026-07-28	2026-07-28 09:05:00+05:30	2026-07-28 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
33	4	2026-07-29	2026-07-29 10:15:00+05:30	2026-07-29 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
34	4	2026-07-30	2026-07-30 09:05:00+05:30	2026-07-30 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
35	4	2026-07-31	2026-07-31 09:15:00+05:30	2026-07-31 13:45:00+05:30	4.50	HALF_DAY	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
36	4	2026-08-03	2026-08-03 09:05:00+05:30	2026-08-03 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
37	4	2026-08-04	2026-08-04 09:05:00+05:30	2026-08-04 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
38	4	2026-08-05	2026-08-05 09:05:00+05:30	2026-08-05 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
39	4	2026-08-06	2026-08-06 09:05:00+05:30	2026-08-06 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
40	4	2026-08-07	2026-08-07 09:05:00+05:30	2026-08-07 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
41	4	2026-08-10	2026-08-10 09:05:00+05:30	2026-08-10 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
42	4	2026-08-11	2026-08-11 10:15:00+05:30	2026-08-11 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
43	4	2026-08-12	2026-08-12 09:05:00+05:30	2026-08-12 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
44	4	2026-08-13	2026-08-13 09:15:00+05:30	2026-08-13 13:45:00+05:30	4.50	HALF_DAY	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
45	5	2026-07-15	2026-07-15 09:15:00+05:30	2026-07-15 13:45:00+05:30	4.50	HALF_DAY	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
46	5	2026-07-16	2026-07-16 09:05:00+05:30	2026-07-16 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
47	5	2026-07-17	2026-07-17 09:05:00+05:30	2026-07-17 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
48	5	2026-07-20	2026-07-20 09:05:00+05:30	2026-07-20 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
49	5	2026-07-21	2026-07-21 09:05:00+05:30	2026-07-21 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
50	5	2026-07-22	2026-07-22 09:05:00+05:30	2026-07-22 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
51	5	2026-07-23	2026-07-23 09:05:00+05:30	2026-07-23 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
52	5	2026-07-24	2026-07-24 09:05:00+05:30	2026-07-24 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
53	5	2026-07-27	2026-07-27 09:15:00+05:30	2026-07-27 13:45:00+05:30	4.50	HALF_DAY	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
54	5	2026-07-28	2026-07-28 09:05:00+05:30	2026-07-28 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
55	5	2026-07-29	2026-07-29 09:05:00+05:30	2026-07-29 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
56	5	2026-07-30	2026-07-30 09:05:00+05:30	2026-07-30 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
57	5	2026-07-31	2026-07-31 09:05:00+05:30	2026-07-31 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
58	5	2026-08-03	2026-08-03 09:05:00+05:30	2026-08-03 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
59	5	2026-08-04	2026-08-04 09:05:00+05:30	2026-08-04 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
60	5	2026-08-05	2026-08-05 09:05:00+05:30	2026-08-05 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
61	5	2026-08-06	2026-08-06 09:05:00+05:30	2026-08-06 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
62	5	2026-08-07	2026-08-07 10:15:00+05:30	2026-08-07 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
63	5	2026-08-10	2026-08-10 10:15:00+05:30	2026-08-10 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
64	5	2026-08-11	2026-08-11 09:05:00+05:30	2026-08-11 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
65	5	2026-08-12	2026-08-12 10:15:00+05:30	2026-08-12 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
66	5	2026-08-13	2026-08-13 09:05:00+05:30	2026-08-13 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
67	6	2026-07-15	2026-07-15 09:05:00+05:30	2026-07-15 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
68	6	2026-07-16	2026-07-16 09:05:00+05:30	2026-07-16 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
69	6	2026-07-17	2026-07-17 10:15:00+05:30	2026-07-17 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
70	6	2026-07-20	2026-07-20 09:05:00+05:30	2026-07-20 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
71	6	2026-07-21	2026-07-21 09:05:00+05:30	2026-07-21 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
72	6	2026-07-22	2026-07-22 09:05:00+05:30	2026-07-22 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
73	6	2026-07-23	2026-07-23 09:05:00+05:30	2026-07-23 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
74	6	2026-07-24	2026-07-24 09:05:00+05:30	2026-07-24 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
75	6	2026-07-27	2026-07-27 09:05:00+05:30	2026-07-27 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
76	6	2026-07-28	2026-07-28 09:05:00+05:30	2026-07-28 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
77	6	2026-07-29	2026-07-29 09:05:00+05:30	2026-07-29 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
78	6	2026-07-30	2026-07-30 09:05:00+05:30	2026-07-30 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
79	6	2026-07-31	2026-07-31 09:05:00+05:30	2026-07-31 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
80	6	2026-08-03	2026-08-03 09:15:00+05:30	2026-08-03 13:45:00+05:30	4.50	HALF_DAY	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
81	6	2026-08-04	2026-08-04 09:05:00+05:30	2026-08-04 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
82	6	2026-08-05	2026-08-05 09:05:00+05:30	2026-08-05 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
83	6	2026-08-06	2026-08-06 09:05:00+05:30	2026-08-06 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
84	6	2026-08-07	2026-08-07 09:05:00+05:30	2026-08-07 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
85	6	2026-08-10	\N	\N	0.00	LEAVE	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
86	6	2026-08-11	\N	\N	0.00	LEAVE	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
87	6	2026-08-12	2026-08-12 09:05:00+05:30	2026-08-12 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
88	6	2026-08-13	2026-08-13 09:15:00+05:30	2026-08-13 13:45:00+05:30	4.50	HALF_DAY	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
89	7	2026-07-15	2026-07-15 10:15:00+05:30	2026-07-15 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
90	7	2026-07-16	2026-07-16 09:05:00+05:30	2026-07-16 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
91	7	2026-07-17	2026-07-17 09:05:00+05:30	2026-07-17 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
92	7	2026-07-20	2026-07-20 09:05:00+05:30	2026-07-20 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
93	7	2026-07-21	2026-07-21 09:05:00+05:30	2026-07-21 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
94	7	2026-07-22	2026-07-22 09:05:00+05:30	2026-07-22 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
95	7	2026-07-23	2026-07-23 09:05:00+05:30	2026-07-23 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
96	7	2026-07-24	2026-07-24 09:05:00+05:30	2026-07-24 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
97	7	2026-07-27	2026-07-27 09:05:00+05:30	2026-07-27 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
98	7	2026-07-28	2026-07-28 09:05:00+05:30	2026-07-28 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
99	7	2026-07-29	2026-07-29 10:15:00+05:30	2026-07-29 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
100	7	2026-07-30	2026-07-30 09:05:00+05:30	2026-07-30 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
101	7	2026-07-31	2026-07-31 09:05:00+05:30	2026-07-31 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
102	7	2026-08-03	2026-08-03 09:05:00+05:30	2026-08-03 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
103	7	2026-08-04	2026-08-04 09:05:00+05:30	2026-08-04 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
104	7	2026-08-05	2026-08-05 10:15:00+05:30	2026-08-05 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
105	7	2026-08-06	2026-08-06 09:05:00+05:30	2026-08-06 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
106	7	2026-08-07	2026-08-07 09:05:00+05:30	2026-08-07 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
107	7	2026-08-10	2026-08-10 09:15:00+05:30	2026-08-10 13:45:00+05:30	4.50	HALF_DAY	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
108	7	2026-08-11	2026-08-11 09:05:00+05:30	2026-08-11 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
109	7	2026-08-12	2026-08-12 09:05:00+05:30	2026-08-12 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
110	7	2026-08-13	2026-08-13 09:05:00+05:30	2026-08-13 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
111	8	2026-07-15	2026-07-15 09:05:00+05:30	2026-07-15 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
112	8	2026-07-16	2026-07-16 09:05:00+05:30	2026-07-16 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
113	8	2026-07-17	2026-07-17 09:05:00+05:30	2026-07-17 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
114	8	2026-07-20	2026-07-20 09:05:00+05:30	2026-07-20 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
115	8	2026-07-21	2026-07-21 09:05:00+05:30	2026-07-21 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
116	8	2026-07-22	2026-07-22 09:05:00+05:30	2026-07-22 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
117	8	2026-07-23	2026-07-23 09:05:00+05:30	2026-07-23 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
118	8	2026-07-24	2026-07-24 09:05:00+05:30	2026-07-24 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
119	8	2026-07-27	2026-07-27 09:15:00+05:30	2026-07-27 13:45:00+05:30	4.50	HALF_DAY	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
120	8	2026-07-28	2026-07-28 09:05:00+05:30	2026-07-28 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
121	8	2026-07-29	2026-07-29 09:05:00+05:30	2026-07-29 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
122	8	2026-07-30	2026-07-30 09:05:00+05:30	2026-07-30 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
123	8	2026-07-31	2026-07-31 09:05:00+05:30	2026-07-31 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
124	8	2026-08-03	2026-08-03 09:05:00+05:30	2026-08-03 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
125	8	2026-08-04	2026-08-04 09:05:00+05:30	2026-08-04 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
126	8	2026-08-05	2026-08-05 09:05:00+05:30	2026-08-05 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
127	8	2026-08-06	2026-08-06 09:05:00+05:30	2026-08-06 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
128	8	2026-08-07	2026-08-07 09:05:00+05:30	2026-08-07 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
129	8	2026-08-10	2026-08-10 09:05:00+05:30	2026-08-10 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
130	8	2026-08-11	2026-08-11 10:15:00+05:30	2026-08-11 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
131	8	2026-08-12	2026-08-12 10:15:00+05:30	2026-08-12 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
132	8	2026-08-13	2026-08-13 09:05:00+05:30	2026-08-13 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
133	9	2026-07-15	2026-07-15 09:05:00+05:30	2026-07-15 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
134	9	2026-07-16	2026-07-16 09:05:00+05:30	2026-07-16 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
135	9	2026-07-17	2026-07-17 09:05:00+05:30	2026-07-17 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
136	9	2026-07-20	2026-07-20 09:05:00+05:30	2026-07-20 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
137	9	2026-07-21	2026-07-21 09:05:00+05:30	2026-07-21 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
138	9	2026-07-22	2026-07-22 09:05:00+05:30	2026-07-22 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
139	9	2026-07-23	2026-07-23 09:05:00+05:30	2026-07-23 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
140	9	2026-07-24	2026-07-24 09:05:00+05:30	2026-07-24 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
141	9	2026-07-27	2026-07-27 09:05:00+05:30	2026-07-27 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
142	9	2026-07-28	\N	\N	0.00	ABSENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
143	9	2026-07-29	2026-07-29 09:05:00+05:30	2026-07-29 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
144	9	2026-07-30	2026-07-30 10:15:00+05:30	2026-07-30 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
145	9	2026-07-31	2026-07-31 09:05:00+05:30	2026-07-31 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
146	9	2026-08-03	2026-08-03 09:05:00+05:30	2026-08-03 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
147	9	2026-08-04	2026-08-04 09:05:00+05:30	2026-08-04 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
148	9	2026-08-05	2026-08-05 09:15:00+05:30	2026-08-05 13:45:00+05:30	4.50	HALF_DAY	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
149	9	2026-08-06	2026-08-06 09:05:00+05:30	2026-08-06 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
150	9	2026-08-07	2026-08-07 09:05:00+05:30	2026-08-07 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
151	9	2026-08-10	2026-08-10 09:15:00+05:30	2026-08-10 13:45:00+05:30	4.50	HALF_DAY	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
152	9	2026-08-11	2026-08-11 09:15:00+05:30	2026-08-11 13:45:00+05:30	4.50	HALF_DAY	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
153	9	2026-08-12	2026-08-12 09:05:00+05:30	2026-08-12 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
154	9	2026-08-13	2026-08-13 09:05:00+05:30	2026-08-13 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
155	10	2026-07-15	2026-07-15 09:05:00+05:30	2026-07-15 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
156	10	2026-07-16	2026-07-16 09:05:00+05:30	2026-07-16 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
157	10	2026-07-17	2026-07-17 09:05:00+05:30	2026-07-17 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
158	10	2026-07-20	2026-07-20 09:05:00+05:30	2026-07-20 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
159	10	2026-07-21	2026-07-21 10:15:00+05:30	2026-07-21 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
160	10	2026-07-22	2026-07-22 09:05:00+05:30	2026-07-22 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
161	10	2026-07-23	2026-07-23 10:15:00+05:30	2026-07-23 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
162	10	2026-07-24	2026-07-24 09:05:00+05:30	2026-07-24 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
163	10	2026-07-27	2026-07-27 09:05:00+05:30	2026-07-27 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
164	10	2026-07-28	2026-07-28 09:05:00+05:30	2026-07-28 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
165	10	2026-07-29	2026-07-29 10:15:00+05:30	2026-07-29 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
166	10	2026-07-30	2026-07-30 09:05:00+05:30	2026-07-30 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
167	10	2026-07-31	2026-07-31 09:05:00+05:30	2026-07-31 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
168	10	2026-08-03	2026-08-03 09:05:00+05:30	2026-08-03 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
169	10	2026-08-04	2026-08-04 09:05:00+05:30	2026-08-04 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
170	10	2026-08-05	\N	\N	0.00	LEAVE	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
171	10	2026-08-06	2026-08-06 09:05:00+05:30	2026-08-06 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
172	10	2026-08-07	2026-08-07 09:05:00+05:30	2026-08-07 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
173	10	2026-08-10	2026-08-10 09:05:00+05:30	2026-08-10 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
174	10	2026-08-11	2026-08-11 09:15:00+05:30	2026-08-11 13:45:00+05:30	4.50	HALF_DAY	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
175	10	2026-08-12	2026-08-12 10:15:00+05:30	2026-08-12 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
176	10	2026-08-13	2026-08-13 09:05:00+05:30	2026-08-13 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
177	11	2026-07-15	2026-07-15 09:05:00+05:30	2026-07-15 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
178	11	2026-07-16	2026-07-16 10:15:00+05:30	2026-07-16 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
179	11	2026-07-17	2026-07-17 10:15:00+05:30	2026-07-17 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
180	11	2026-07-20	2026-07-20 09:15:00+05:30	2026-07-20 13:45:00+05:30	4.50	HALF_DAY	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
181	11	2026-07-21	2026-07-21 09:05:00+05:30	2026-07-21 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
182	11	2026-07-22	2026-07-22 09:05:00+05:30	2026-07-22 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
183	11	2026-07-23	2026-07-23 10:15:00+05:30	2026-07-23 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
184	11	2026-07-24	2026-07-24 09:05:00+05:30	2026-07-24 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
185	11	2026-07-27	2026-07-27 09:05:00+05:30	2026-07-27 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
186	11	2026-07-28	2026-07-28 09:05:00+05:30	2026-07-28 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
187	11	2026-07-29	2026-07-29 09:05:00+05:30	2026-07-29 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
188	11	2026-07-30	2026-07-30 09:15:00+05:30	2026-07-30 13:45:00+05:30	4.50	HALF_DAY	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
189	11	2026-07-31	2026-07-31 10:15:00+05:30	2026-07-31 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
190	11	2026-08-03	2026-08-03 10:15:00+05:30	2026-08-03 19:15:00+05:30	9.00	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
191	11	2026-08-04	2026-08-04 09:05:00+05:30	2026-08-04 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
192	11	2026-08-05	2026-08-05 09:05:00+05:30	2026-08-05 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
193	11	2026-08-06	2026-08-06 09:05:00+05:30	2026-08-06 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
194	11	2026-08-07	2026-08-07 09:05:00+05:30	2026-08-07 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
195	11	2026-08-10	2026-08-10 09:05:00+05:30	2026-08-10 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
196	11	2026-08-11	2026-08-11 09:05:00+05:30	2026-08-11 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
197	11	2026-08-12	2026-08-12 09:05:00+05:30	2026-08-12 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
198	11	2026-08-13	2026-08-13 09:05:00+05:30	2026-08-13 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
199	12	2026-07-15	2026-07-15 09:05:00+05:30	2026-07-15 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
200	12	2026-07-16	2026-07-16 09:05:00+05:30	2026-07-16 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
201	12	2026-07-17	2026-07-17 09:05:00+05:30	2026-07-17 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
202	12	2026-07-20	2026-07-20 09:05:00+05:30	2026-07-20 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
203	12	2026-07-21	2026-07-21 09:05:00+05:30	2026-07-21 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
204	12	2026-07-22	2026-07-22 09:05:00+05:30	2026-07-22 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
205	12	2026-07-23	2026-07-23 09:05:00+05:30	2026-07-23 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
206	12	2026-07-24	2026-07-24 09:05:00+05:30	2026-07-24 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
207	12	2026-07-27	2026-07-27 09:05:00+05:30	2026-07-27 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
208	12	2026-07-28	2026-07-28 09:05:00+05:30	2026-07-28 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
209	12	2026-07-29	2026-07-29 09:05:00+05:30	2026-07-29 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
210	12	2026-07-30	2026-07-30 09:05:00+05:30	2026-07-30 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
211	12	2026-07-31	2026-07-31 09:05:00+05:30	2026-07-31 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
212	12	2026-08-03	2026-08-03 09:05:00+05:30	2026-08-03 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
213	12	2026-08-04	2026-08-04 09:05:00+05:30	2026-08-04 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
214	12	2026-08-05	2026-08-05 09:15:00+05:30	2026-08-05 13:45:00+05:30	4.50	HALF_DAY	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
215	12	2026-08-06	2026-08-06 09:05:00+05:30	2026-08-06 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
216	12	2026-08-07	2026-08-07 09:05:00+05:30	2026-08-07 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
217	12	2026-08-10	2026-08-10 09:05:00+05:30	2026-08-10 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
218	12	2026-08-11	2026-08-11 09:05:00+05:30	2026-08-11 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
219	12	2026-08-12	2026-08-12 09:05:00+05:30	2026-08-12 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
220	12	2026-08-13	2026-08-13 09:05:00+05:30	2026-08-13 18:15:00+05:30	9.16	PRESENT	2026-08-22 10:30:19.770479+05:30	2026-08-22 10:30:19.770479+05:30
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at) FROM stdin;
1	1	USER_LOGIN	USER	1	{"status": "SUCCESS", "browser": "Chrome 128 on Windows 11"}	192.168.1.10	2026-08-22 08:30:00+05:30
2	2	USER_LOGIN	USER	2	{"status": "SUCCESS", "browser": "Firefox 129 on macOS"}	192.168.1.15	2026-08-22 08:45:00+05:30
3	1	CREATE_EMPLOYEE	EMPLOYEE	12	{"name": "Ishita Kapoor", "role": "Product Designer", "employee_code": "EMP010"}	192.168.1.10	2026-08-01 09:30:00+05:30
4	1	UPDATE_SALARY	SALARY_STRUCTURE	12	{"currency": "INR", "net_salary": 60000.00, "employee_id": 12}	192.168.1.10	2026-08-01 10:00:00+05:30
5	1	APPROVE_LEAVE	LEAVE	3	{"days": 2, "leave_id": 3, "employee_code": "EMP002"}	192.168.1.10	2026-07-20 11:15:00+05:30
6	2	APPROVE_LEAVE	LEAVE	2	{"type": "SICK", "leave_id": 2, "employee_code": "EMP004"}	192.168.1.15	2026-08-09 16:30:00+05:30
7	2	REJECT_LEAVE	LEAVE	4	{"reason": "Quarter-end sales push", "leave_id": 4, "employee_code": "EMP007"}	192.168.1.15	2026-08-15 14:00:00+05:30
8	1	PROCESS_PAYROLL	PAYROLL	JULY_2026	{"status": "PAID", "total_employees": 10, "total_disbursement": 581000.00}	192.168.1.10	2026-07-31 18:00:00+05:30
9	2	MODIFY_ATTENDANCE	ATTENDANCE	EMP007_20260728	{"date": "2026-07-28", "status": "ABSENT", "employee_id": 9}	192.168.1.15	2026-07-29 10:00:00+05:30
10	2	UPLOAD_DOCUMENT	DOCUMENT	15	{"document_type": "OFFER_LETTER", "employee_code": "EMP010"}	192.168.1.15	2026-08-01 10:15:00+05:30
11	1	USER_LOGIN	USER	1	{"role": "ADMIN", "email": "priya.menon@dayflow.demo"}	::1	2026-08-22 11:02:48.659156+05:30
12	1	USER_LOGIN	USER	1	{"email": "priya.menon@dayflow.demo", "login_id": "ADM001"}	::1	2026-08-22 11:28:54.943421+05:30
13	3	USER_LOGIN	USER	3	{"email": "aarav@dayflow.demo", "login_id": "EMP001"}	::1	2026-08-22 11:28:55.00305+05:30
14	1	CREATE_EMPLOYEE	EMPLOYEE	13	{"email": "john.doe.1787378335005@odoo.demo", "login_id": "OIJODO20220001", "created_by": "priya.menon@dayflow.demo"}	::1	2026-08-22 11:28:55.089619+05:30
15	13	USER_LOGIN	USER	13	{"email": "john.doe.1787378335005@odoo.demo", "login_id": "OIJODO20220001"}	::1	2026-08-22 11:28:55.142363+05:30
16	14	COMPANY_SIGNUP	USER	14	{"email": "jane.smith.1787378335143@odoo.demo", "login_id": "OIJASM20260001", "company_name": "Odoo India Pvt Ltd"}	\N	2026-08-22 11:28:55.145634+05:30
17	1	USER_LOGIN	USER	1	{"email": "priya.menon@dayflow.demo", "login_id": "ADM001"}	::1	2026-08-22 11:29:27.66778+05:30
18	1	USER_LOGIN	USER	1	{"email": "priya.menon@dayflow.demo", "login_id": "ADM001"}	::1	2026-08-22 11:35:48.965192+05:30
19	1	USER_LOGIN	USER	1	{"email": "priya.menon@dayflow.demo", "login_id": "ADM001"}	::1	2026-08-22 11:36:13.023072+05:30
20	1	CREATE_EMPLOYEE	EMPLOYEE	15	{"email": "john.doe@dayflow.demo", "login_id": "OIJODO20260002", "created_by": "priya.menon@dayflow.demo"}	::1	2026-08-22 11:43:25.286001+05:30
21	1	USER_LOGIN	USER	1	{"email": "priya.menon@dayflow.demo", "login_id": "ADM001"}	::1	2026-08-22 12:10:37.33103+05:30
22	1	USER_LOGIN	USER	1	{"email": "priya.menon@dayflow.demo", "login_id": "ADM001"}	::1	2026-08-22 12:16:48.27908+05:30
23	1	USER_LOGIN	USER	1	{"email": "priya.menon@dayflow.demo", "login_id": "ADM001"}	::1	2026-08-22 12:20:24.807516+05:30
24	1	USER_LOGIN	USER	1	{"email": "priya.menon@dayflow.demo", "login_id": "ADM001"}	::1	2026-08-22 12:22:24.942989+05:30
25	1	USER_LOGIN	USER	1	{"email": "priya.menon@dayflow.demo", "login_id": "ADM001"}	::1	2026-08-22 12:24:48.709468+05:30
26	1	USER_LOGIN	USER	1	{"email": "priya.menon@dayflow.demo", "login_id": "ADM001"}	::1	2026-08-22 12:30:06.21785+05:30
27	1	USER_LOGIN	USER	1	{"email": "priya.menon@dayflow.demo", "login_id": "ADM001"}	::1	2026-08-22 12:57:37.420646+05:30
28	1	USER_LOGIN	USER	1	{"email": "priya.menon@dayflow.demo", "login_id": "ADM001"}	::1	2026-08-22 13:00:58.544696+05:30
29	1	USER_LOGIN	USER	1	{"email": "priya.menon@dayflow.demo", "login_id": "ADM001"}	::1	2026-08-22 13:07:14.125019+05:30
30	1	USER_LOGIN	USER	1	{"email": "priya.menon@dayflow.demo", "login_id": "ADM001"}	::1	2026-08-22 13:07:45.943788+05:30
31	1	USER_LOGIN	USER	1	{"email": "priya.menon@dayflow.demo", "login_id": "ADM001"}	::1	2026-08-22 13:09:37.436657+05:30
32	1	USER_LOGIN	USER	1	{"email": "priya.menon@dayflow.demo", "login_id": "ADM001"}	::1	2026-08-22 13:11:57.152112+05:30
33	1	USER_LOGIN	USER	1	{"email": "priya.menon@dayflow.demo", "login_id": "ADM001"}	::1	2026-08-22 13:14:45.959813+05:30
34	1	USER_LOGIN	USER	1	{"email": "priya.menon@dayflow.demo", "login_id": "ADM001"}	::1	2026-08-22 13:15:31.352768+05:30
35	3	USER_LOGIN	USER	3	{"email": "aarav@dayflow.demo", "login_id": "EMP001"}	::1	2026-08-22 13:15:31.405028+05:30
36	1	CREATE_EMPLOYEE	EMPLOYEE	16	{"email": "john.doe.1787384731406@odoo.demo", "login_id": "OIJODO20220002", "created_by": "priya.menon@dayflow.demo"}	::1	2026-08-22 13:15:31.486298+05:30
37	16	USER_LOGIN	USER	16	{"email": "john.doe.1787384731406@odoo.demo", "login_id": "OIJODO20220002"}	::1	2026-08-22 13:15:31.538548+05:30
38	17	COMPANY_SIGNUP	USER	17	{"email": "jane.smith.1787384731539@odoo.demo", "login_id": "OIJASM20260003", "company_name": "Odoo India Pvt Ltd"}	\N	2026-08-22 13:15:31.540966+05:30
39	1	USER_LOGIN	USER	1	{"email": "priya.menon@dayflow.demo", "login_id": "ADM001"}	::1	2026-08-22 13:18:56.539854+05:30
40	1	USER_LOGIN	USER	1	{"email": "priya.menon@dayflow.demo", "login_id": "ADM001"}	::1	2026-08-22 13:31:24.366264+05:30
41	3	USER_LOGIN	USER	3	{"email": "aarav@dayflow.demo", "login_id": "EMP001"}	::1	2026-08-22 13:31:24.43479+05:30
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.departments (id, name, description, created_at, updated_at) FROM stdin;
1	Human Resources	People operations, talent acquisition, culture, and employee relations	2026-08-22 10:30:19.759882+05:30	2026-08-22 10:30:19.759882+05:30
2	Engineering	Core software development, architecture, infrastructure, and DevOps	2026-08-22 10:30:19.759882+05:30	2026-08-22 10:30:19.759882+05:30
3	Design	Product design, UI/UX, user research, and brand creative systems	2026-08-22 10:30:19.759882+05:30	2026-08-22 10:30:19.759882+05:30
4	Marketing	Brand marketing, digital campaigns, content, and growth operations	2026-08-22 10:30:19.759882+05:30	2026-08-22 10:30:19.759882+05:30
5	Finance	Financial planning, accounting, auditing, and payroll compliance	2026-08-22 10:30:19.759882+05:30	2026-08-22 10:30:19.759882+05:30
6	Sales	Business development, client acquisition, and enterprise sales	2026-08-22 10:30:19.759882+05:30	2026-08-22 10:30:19.759882+05:30
\.


--
-- Data for Name: designations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.designations (id, department_id, title, description, created_at, updated_at) FROM stdin;
1	1	HR Manager	Leads human resource strategies and oversees employee lifecycle	2026-08-22 10:30:19.762697+05:30	2026-08-22 10:30:19.762697+05:30
2	1	HR Executive	Handles day-to-day HR operations, attendance, and onboarding	2026-08-22 10:30:19.762697+05:30	2026-08-22 10:30:19.762697+05:30
3	2	Software Engineer	Builds full-stack features and maintains scalable services	2026-08-22 10:30:19.762697+05:30	2026-08-22 10:30:19.762697+05:30
4	2	Backend Developer	Designs REST APIs, database schemas, and microservices	2026-08-22 10:30:19.762697+05:30	2026-08-22 10:30:19.762697+05:30
5	2	DevOps Engineer	Manages CI/CD pipelines, container orchestration, and cloud infrastructure	2026-08-22 10:30:19.762697+05:30	2026-08-22 10:30:19.762697+05:30
6	2	Frontend Developer	Crafts modern, accessible, and responsive user interfaces	2026-08-22 10:30:19.762697+05:30	2026-08-22 10:30:19.762697+05:30
7	3	UI/UX Designer	Designs user flows, wireframes, prototypes, and visual design systems	2026-08-22 10:30:19.762697+05:30	2026-08-22 10:30:19.762697+05:30
8	3	Product Designer	Leads end-to-end product design from concept to delivery	2026-08-22 10:30:19.762697+05:30	2026-08-22 10:30:19.762697+05:30
9	4	Marketing Executive	Drives organic campaigns, content marketing, and brand outreach	2026-08-22 10:30:19.762697+05:30	2026-08-22 10:30:19.762697+05:30
10	5	Financial Analyst	Monitors corporate budgets, financial reporting, and payroll audits	2026-08-22 10:30:19.762697+05:30	2026-08-22 10:30:19.762697+05:30
11	6	Sales Executive	Manages sales pipelines, client relationships, and revenue targets	2026-08-22 10:30:19.762697+05:30	2026-08-22 10:30:19.762697+05:30
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.documents (id, employee_id, document_name, document_type, document_url, uploaded_at, created_at) FROM stdin;
1	3	Aarav_Sharma_Offer_Letter.pdf	OFFER_LETTER	https://storage.dayflow.demo/docs/EMP001/offer_letter.pdf	2023-01-05 10:00:00+05:30	2026-08-22 10:30:19.784581+05:30
2	3	Aarav_Sharma_Aadhar_Card.pdf	ID_PROOF	https://storage.dayflow.demo/docs/EMP001/id_proof.pdf	2023-01-08 14:30:00+05:30	2026-08-22 10:30:19.784581+05:30
3	3	Aarav_Sharma_Resume.pdf	RESUME	https://storage.dayflow.demo/docs/EMP001/resume.pdf	2023-01-04 11:20:00+05:30	2026-08-22 10:30:19.784581+05:30
4	4	Ananya_Rao_Offer_Letter.pdf	OFFER_LETTER	https://storage.dayflow.demo/docs/EMP002/offer_letter.pdf	2023-02-10 11:00:00+05:30	2026-08-22 10:30:19.784581+05:30
5	4	Ananya_Rao_Passport.pdf	ID_PROOF	https://storage.dayflow.demo/docs/EMP002/passport.pdf	2023-02-12 16:15:00+05:30	2026-08-22 10:30:19.784581+05:30
6	4	Ananya_Rao_Portfolio.pdf	RESUME	https://storage.dayflow.demo/docs/EMP002/portfolio.pdf	2023-02-08 15:00:00+05:30	2026-08-22 10:30:19.784581+05:30
7	5	Rohan_Mehta_Employment_Contract.pdf	CONTRACT	https://storage.dayflow.demo/docs/EMP003/contract.pdf	2022-05-25 12:00:00+05:30	2026-08-22 10:30:19.784581+05:30
8	5	Rohan_Mehta_Salary_Slip_July2026.pdf	SALARY_SLIP	https://storage.dayflow.demo/docs/EMP003/payslip_jul2026.pdf	2026-07-31 18:30:00+05:30	2026-08-22 10:30:19.784581+05:30
9	6	Diya_Nair_Offer_Letter.pdf	OFFER_LETTER	https://storage.dayflow.demo/docs/EMP004/offer_letter.pdf	2023-04-28 10:45:00+05:30	2026-08-22 10:30:19.784581+05:30
10	7	Arjun_Patel_Professional_Cert.pdf	RESUME	https://storage.dayflow.demo/docs/EMP005/certifications.pdf	2022-11-10 13:20:00+05:30	2026-08-22 10:30:19.784581+05:30
11	8	Sneha_Iyer_Offer_Letter.pdf	OFFER_LETTER	https://storage.dayflow.demo/docs/EMP006/offer_letter.pdf	2021-08-15 09:30:00+05:30	2026-08-22 10:30:19.784581+05:30
12	9	Kabir_Singh_ID_Proof.pdf	ID_PROOF	https://storage.dayflow.demo/docs/EMP007/id_proof.pdf	2023-04-05 14:00:00+05:30	2026-08-22 10:30:19.784581+05:30
13	10	Kavya_Reddy_Degree_Cert.pdf	RESUME	https://storage.dayflow.demo/docs/EMP008/degree.pdf	2023-02-25 11:30:00+05:30	2026-08-22 10:30:19.784581+05:30
14	11	Rahul_Verma_Contract.pdf	CONTRACT	https://storage.dayflow.demo/docs/EMP009/contract.pdf	2023-07-10 16:45:00+05:30	2026-08-22 10:30:19.784581+05:30
15	12	Ishita_Kapoor_Offer_Letter.pdf	OFFER_LETTER	https://storage.dayflow.demo/docs/EMP010/offer_letter.pdf	2022-08-25 10:15:00+05:30	2026-08-22 10:30:19.784581+05:30
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employees (id, user_id, employee_code, first_name, last_name, gender, date_of_birth, phone, address, department_id, designation_id, joining_date, profile_picture_url, employment_status, created_at, updated_at) FROM stdin;
1	1	ADM001	Priya	Menon	FEMALE	1988-04-12	+91-9876543201	Flat 402, Green Glen Heights, HSR Layout, Bengaluru, KA	1	1	2021-01-15	https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400	ACTIVE	2026-08-22 10:30:19.766311+05:30	2026-08-22 10:30:19.766311+05:30
2	2	HR001	Meera	Joshi	FEMALE	1992-09-24	+91-9876543202	Tower 3, Apt 11B, Indiranagar, Bengaluru, KA	1	2	2022-03-01	https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400	ACTIVE	2026-08-22 10:30:19.766311+05:30	2026-08-22 10:30:19.766311+05:30
3	3	EMP001	Aarav	Sharma	MALE	1995-06-18	+91-9876543203	14/B, Koramangala 4th Block, Bengaluru, KA	2	3	2023-01-10	https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400	ACTIVE	2026-08-22 10:30:19.766311+05:30	2026-08-22 10:30:19.766311+05:30
4	4	EMP002	Ananya	Rao	FEMALE	1996-11-05	+91-9876543204	88, Palm Meadows, Whitefield, Bengaluru, KA	3	7	2023-02-15	https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400	ACTIVE	2026-08-22 10:30:19.766311+05:30	2026-08-22 10:30:19.766311+05:30
5	5	EMP003	Rohan	Mehta	MALE	1993-08-30	+91-9876543205	Villa 7, Prestige Ozone, Whitefield, Bengaluru, KA	2	4	2022-06-01	https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400	ACTIVE	2026-08-22 10:30:19.766311+05:30	2026-08-22 10:30:19.766311+05:30
6	6	EMP004	Diya	Nair	FEMALE	1997-02-14	+91-9876543206	204, Sunset Enclave, Bellandur, Bengaluru, KA	4	9	2023-05-02	https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400	ACTIVE	2026-08-22 10:30:19.766311+05:30	2026-08-22 10:30:19.766311+05:30
7	7	EMP005	Arjun	Patel	MALE	1994-12-20	+91-9876543207	512, Brigade Gateway, Malleshwaram, Bengaluru, KA	5	10	2022-11-15	https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400	ACTIVE	2026-08-22 10:30:19.766311+05:30	2026-08-22 10:30:19.766311+05:30
8	8	EMP006	Sneha	Iyer	FEMALE	1992-07-09	+91-9876543208	45, Lake View Residency, Electronic City, Bengaluru, KA	2	5	2021-08-20	https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400	ACTIVE	2026-08-22 10:30:19.766311+05:30	2026-08-22 10:30:19.766311+05:30
9	9	EMP007	Kabir	Singh	MALE	1995-03-27	+91-9876543209	701, Sobha Iris, Outer Ring Road, Bengaluru, KA	6	11	2023-04-10	https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400	ACTIVE	2026-08-22 10:30:19.766311+05:30	2026-08-22 10:30:19.766311+05:30
10	10	EMP008	Kavya	Reddy	FEMALE	1996-01-19	+91-9876543210	12/A, RMV 2nd Stage, Bengaluru, KA	2	6	2023-03-01	https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400	ACTIVE	2026-08-22 10:30:19.766311+05:30	2026-08-22 10:30:19.766311+05:30
11	11	EMP009	Rahul	Verma	MALE	1998-05-12	+91-9876543211	33, Windmills of Your Mind, Whitefield, Bengaluru, KA	6	11	2023-07-15	https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400	ACTIVE	2026-08-22 10:30:19.766311+05:30	2026-08-22 10:30:19.766311+05:30
12	12	EMP010	Ishita	Kapoor	FEMALE	1995-10-08	+91-9876543212	902, Salarpuria Sattva, Marathahalli, Bengaluru, KA	3	8	2022-09-01	https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400	ACTIVE	2026-08-22 10:30:19.766311+05:30	2026-08-22 10:30:19.766311+05:30
13	13	OIJODO20220001	John	Doe	PREFER_NOT_TO_SAY	\N	+91 9876543210	\N	1	1	2022-06-15	\N	ACTIVE	2026-08-22 11:28:55.008311+05:30	2026-08-22 11:28:55.008311+05:30
14	14	OIJASM20260001	Jane	Smith	\N	\N	+91 9876500000	\N	\N	\N	2026-08-22	\N	ACTIVE	2026-08-22 11:28:55.145634+05:30	2026-08-22 11:28:55.145634+05:30
15	15	OIJODO20260002	John	Doe	PREFER_NOT_TO_SAY	\N	+91 99999 88888	\N	\N	\N	2026-08-22	\N	ACTIVE	2026-08-22 11:43:25.087881+05:30	2026-08-22 11:43:25.087881+05:30
16	16	OIJODO20220002	John	Doe	PREFER_NOT_TO_SAY	\N	+91 9876543210	\N	1	1	2022-06-15	\N	ACTIVE	2026-08-22 13:15:31.408388+05:30	2026-08-22 13:15:31.408388+05:30
17	17	OIJASM20260003	Jane	Smith	\N	\N	+91 9876500000	\N	\N	\N	2026-08-22	\N	ACTIVE	2026-08-22 13:15:31.540966+05:30	2026-08-22 13:15:31.540966+05:30
\.


--
-- Data for Name: leaves; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leaves (id, employee_id, leave_type, start_date, end_date, reason, status, reviewed_by, reviewer_comment, reviewed_at, created_at, updated_at) FROM stdin;
1	5	PAID	2026-09-01	2026-09-03	Attending cousin wedding out of town	PENDING	\N	\N	\N	2026-08-22 10:30:19.780313+05:30	2026-08-22 10:30:19.780313+05:30
2	6	SICK	2026-08-10	2026-08-11	Severe viral infection and fever	APPROVED	2	Approved. Rest well and submit doctor prescription upon return.	2026-08-09 16:30:00+05:30	2026-08-22 10:30:19.780313+05:30	2026-08-22 10:30:19.780313+05:30
3	4	PAID	2026-07-22	2026-07-23	Personal family function and travel	APPROVED	1	Approved. Ensure design handover is completed with Ishita.	2026-07-20 11:15:00+05:30	2026-08-22 10:30:19.780313+05:30	2026-08-22 10:30:19.780313+05:30
4	9	UNPAID	2026-08-25	2026-08-28	Extended leisure road trip with college friends	REJECTED	2	Rejected due to critical quarter-end sales drive and target reviews.	2026-08-15 14:00:00+05:30	2026-08-22 10:30:19.780313+05:30	2026-08-22 10:30:19.780313+05:30
5	8	SICK	2026-08-24	2026-08-25	Severe dental surgery recovery	PENDING	\N	\N	\N	2026-08-22 10:30:19.780313+05:30	2026-08-22 10:30:19.780313+05:30
6	3	PAID	2026-07-16	2026-07-17	Annual family vacation	APPROVED	1	Approved. Enjoy your time off!	2026-07-14 10:00:00+05:30	2026-08-22 10:30:19.780313+05:30	2026-08-22 10:30:19.780313+05:30
7	7	PAID	2026-08-04	2026-08-04	Attending certified financial auditor licensing exam	APPROVED	1	Approved. Best wishes for the exam.	2026-08-02 09:45:00+05:30	2026-08-22 10:30:19.780313+05:30	2026-08-22 10:30:19.780313+05:30
8	10	SICK	2026-08-05	2026-08-05	Acute food poisoning and doctor consultation	APPROVED	2	Approved. Take care.	2026-08-05 08:30:00+05:30	2026-08-22 10:30:19.780313+05:30	2026-08-22 10:30:19.780313+05:30
9	11	UNPAID	2026-08-18	2026-08-20	Personal side project conference	REJECTED	2	Rejected. Clashes with mandatory enterprise client onboarding demos.	2026-08-14 17:10:00+05:30	2026-08-22 10:30:19.780313+05:30	2026-08-22 10:30:19.780313+05:30
10	12	PAID	2026-09-08	2026-09-10	Attending National Design Conclave 2026	PENDING	\N	\N	\N	2026-08-22 10:30:19.780313+05:30	2026-08-22 10:30:19.780313+05:30
11	3	SICK	2026-07-30	2026-07-30	Seasonal cold and migraine	APPROVED	2	Approved. Feel better soon.	2026-07-30 08:15:00+05:30	2026-08-22 10:30:19.780313+05:30	2026-08-22 10:30:19.780313+05:30
12	9	PAID	2026-07-10	2026-07-10	Home shifting and lease documentation	APPROVED	1	Approved.	2026-07-08 15:20:00+05:30	2026-08-22 10:30:19.780313+05:30	2026-08-22 10:30:19.780313+05:30
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, title, message, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: payrolls; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payrolls (id, employee_id, month, year, basic_salary, hra, allowances, deductions, net_salary, payment_status, payment_date, remarks, created_at, updated_at) FROM stdin;
1	3	7	2026	32500.00	16250.00	19500.00	3250.00	65000.00	PAID	2026-07-31	Direct bank transfer reference #NEFT2026073101	2026-08-22 10:30:19.782538+05:30	2026-08-22 10:30:19.782538+05:30
2	4	7	2026	29000.00	14500.00	17400.00	2900.00	58000.00	PAID	2026-07-31	Direct bank transfer reference #NEFT2026073102	2026-08-22 10:30:19.782538+05:30	2026-08-22 10:30:19.782538+05:30
3	5	7	2026	36000.00	18000.00	21600.00	3600.00	72000.00	PAID	2026-07-31	Direct bank transfer reference #NEFT2026073103	2026-08-22 10:30:19.782538+05:30	2026-08-22 10:30:19.782538+05:30
4	6	7	2026	22500.00	11250.00	13500.00	2250.00	45000.00	PAID	2026-07-31	Direct bank transfer reference #NEFT2026073104	2026-08-22 10:30:19.782538+05:30	2026-08-22 10:30:19.782538+05:30
5	7	7	2026	27500.00	13750.00	16500.00	2750.00	55000.00	PAID	2026-07-31	Direct bank transfer reference #NEFT2026073105	2026-08-22 10:30:19.782538+05:30	2026-08-22 10:30:19.782538+05:30
6	8	7	2026	39000.00	19500.00	23400.00	3900.00	78000.00	PAID	2026-07-31	Direct bank transfer reference #NEFT2026073106	2026-08-22 10:30:19.782538+05:30	2026-08-22 10:30:19.782538+05:30
7	9	7	2026	21000.00	10500.00	12600.00	2100.00	42000.00	PAID	2026-07-31	Direct bank transfer reference #NEFT2026073107	2026-08-22 10:30:19.782538+05:30	2026-08-22 10:30:19.782538+05:30
8	10	7	2026	31000.00	15500.00	18600.00	3100.00	62000.00	PAID	2026-07-31	Direct bank transfer reference #NEFT2026073108	2026-08-22 10:30:19.782538+05:30	2026-08-22 10:30:19.782538+05:30
9	11	7	2026	22000.00	11000.00	13200.00	2200.00	44000.00	PAID	2026-07-31	Direct bank transfer reference #NEFT2026073109	2026-08-22 10:30:19.782538+05:30	2026-08-22 10:30:19.782538+05:30
10	12	7	2026	30000.00	15000.00	18000.00	3000.00	60000.00	PAID	2026-07-31	Direct bank transfer reference #NEFT2026073110	2026-08-22 10:30:19.782538+05:30	2026-08-22 10:30:19.782538+05:30
11	3	8	2026	32500.00	16250.00	19500.00	3250.00	65000.00	PROCESSED	\N	Payroll computed, awaiting bank batch release	2026-08-22 10:30:19.782538+05:30	2026-08-22 10:30:19.782538+05:30
12	4	8	2026	29000.00	14500.00	17400.00	2900.00	58000.00	PROCESSED	\N	Payroll computed, awaiting bank batch release	2026-08-22 10:30:19.782538+05:30	2026-08-22 10:30:19.782538+05:30
13	5	8	2026	36000.00	18000.00	21600.00	3600.00	72000.00	PROCESSED	\N	Payroll computed, awaiting bank batch release	2026-08-22 10:30:19.782538+05:30	2026-08-22 10:30:19.782538+05:30
14	6	8	2026	22500.00	11250.00	13500.00	2250.00	45000.00	PROCESSED	\N	Payroll computed, awaiting bank batch release	2026-08-22 10:30:19.782538+05:30	2026-08-22 10:30:19.782538+05:30
15	7	8	2026	27500.00	13750.00	16500.00	2750.00	55000.00	PROCESSED	\N	Payroll computed, awaiting bank batch release	2026-08-22 10:30:19.782538+05:30	2026-08-22 10:30:19.782538+05:30
16	8	8	2026	39000.00	19500.00	23400.00	3900.00	78000.00	PENDING	\N	Pending overtime allowance audit	2026-08-22 10:30:19.782538+05:30	2026-08-22 10:30:19.782538+05:30
17	9	8	2026	21000.00	10500.00	12600.00	2100.00	42000.00	PROCESSED	\N	Payroll computed, awaiting bank batch release	2026-08-22 10:30:19.782538+05:30	2026-08-22 10:30:19.782538+05:30
18	10	8	2026	31000.00	15500.00	18600.00	3100.00	62000.00	PROCESSED	\N	Payroll computed, awaiting bank batch release	2026-08-22 10:30:19.782538+05:30	2026-08-22 10:30:19.782538+05:30
19	11	8	2026	22000.00	11000.00	13200.00	2200.00	44000.00	PROCESSED	\N	Payroll computed, awaiting bank batch release	2026-08-22 10:30:19.782538+05:30	2026-08-22 10:30:19.782538+05:30
20	12	8	2026	30000.00	15000.00	18000.00	3000.00	60000.00	PROCESSED	\N	Payroll computed, awaiting bank batch release	2026-08-22 10:30:19.782538+05:30	2026-08-22 10:30:19.782538+05:30
\.


--
-- Data for Name: salary_structures; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.salary_structures (id, employee_id, basic_salary, hra, allowances, deductions, net_salary, currency, created_at, updated_at) FROM stdin;
1	1	50000.00	25000.00	25000.00	5000.00	95000.00	INR	2026-08-22 10:30:19.769197+05:30	2026-08-22 10:30:19.769197+05:30
2	2	30000.00	15000.00	16000.00	3000.00	58000.00	INR	2026-08-22 10:30:19.769197+05:30	2026-08-22 10:30:19.769197+05:30
3	3	32500.00	16250.00	19500.00	3250.00	65000.00	INR	2026-08-22 10:30:19.769197+05:30	2026-08-22 10:30:19.769197+05:30
4	4	29000.00	14500.00	17400.00	2900.00	58000.00	INR	2026-08-22 10:30:19.769197+05:30	2026-08-22 10:30:19.769197+05:30
5	5	36000.00	18000.00	21600.00	3600.00	72000.00	INR	2026-08-22 10:30:19.769197+05:30	2026-08-22 10:30:19.769197+05:30
6	6	22500.00	11250.00	13500.00	2250.00	45000.00	INR	2026-08-22 10:30:19.769197+05:30	2026-08-22 10:30:19.769197+05:30
7	7	27500.00	13750.00	16500.00	2750.00	55000.00	INR	2026-08-22 10:30:19.769197+05:30	2026-08-22 10:30:19.769197+05:30
8	8	39000.00	19500.00	23400.00	3900.00	78000.00	INR	2026-08-22 10:30:19.769197+05:30	2026-08-22 10:30:19.769197+05:30
9	9	21000.00	10500.00	12600.00	2100.00	42000.00	INR	2026-08-22 10:30:19.769197+05:30	2026-08-22 10:30:19.769197+05:30
10	10	31000.00	15500.00	18600.00	3100.00	62000.00	INR	2026-08-22 10:30:19.769197+05:30	2026-08-22 10:30:19.769197+05:30
11	11	22000.00	11000.00	13200.00	2200.00	44000.00	INR	2026-08-22 10:30:19.769197+05:30	2026-08-22 10:30:19.769197+05:30
12	12	30000.00	15000.00	18000.00	3000.00	60000.00	INR	2026-08-22 10:30:19.769197+05:30	2026-08-22 10:30:19.769197+05:30
13	13	80000.00	15000.00	5000.00	3000.00	97000.00	INR	2026-08-22 11:28:55.008311+05:30	2026-08-22 11:28:55.008311+05:30
14	14	75000.00	25000.00	15000.00	5000.00	110000.00	INR	2026-08-22 11:28:55.145634+05:30	2026-08-22 11:28:55.145634+05:30
15	15	75000.00	15000.00	5000.00	3000.00	92000.00	INR	2026-08-22 11:43:25.087881+05:30	2026-08-22 11:43:25.087881+05:30
16	16	80000.00	15000.00	5000.00	3000.00	97000.00	INR	2026-08-22 13:15:31.408388+05:30	2026-08-22 13:15:31.408388+05:30
17	17	75000.00	25000.00	15000.00	5000.00	110000.00	INR	2026-08-22 13:15:31.540966+05:30	2026-08-22 13:15:31.540966+05:30
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, role, is_active, is_verified, created_at, updated_at) FROM stdin;
1	priya.menon@dayflow.demo	$2b$10$t4qIHMk4GjWBN5L1/7CcsupWSv26OiqmFN9dH9yAOhR33mxVPX4MO	ADMIN	t	t	2026-08-22 10:30:19.764352+05:30	2026-08-22 10:30:19.764352+05:30
2	meera.joshi@dayflow.demo	$2b$10$t4qIHMk4GjWBN5L1/7CcsupWSv26OiqmFN9dH9yAOhR33mxVPX4MO	HR	t	t	2026-08-22 10:30:19.764352+05:30	2026-08-22 10:30:19.764352+05:30
3	aarav@dayflow.demo	$2b$10$t4qIHMk4GjWBN5L1/7CcsupWSv26OiqmFN9dH9yAOhR33mxVPX4MO	EMPLOYEE	t	t	2026-08-22 10:30:19.764352+05:30	2026-08-22 10:30:19.764352+05:30
4	ananya@dayflow.demo	$2b$10$t4qIHMk4GjWBN5L1/7CcsupWSv26OiqmFN9dH9yAOhR33mxVPX4MO	EMPLOYEE	t	t	2026-08-22 10:30:19.764352+05:30	2026-08-22 10:30:19.764352+05:30
5	rohan@dayflow.demo	$2b$10$t4qIHMk4GjWBN5L1/7CcsupWSv26OiqmFN9dH9yAOhR33mxVPX4MO	EMPLOYEE	t	t	2026-08-22 10:30:19.764352+05:30	2026-08-22 10:30:19.764352+05:30
6	diya@dayflow.demo	$2b$10$t4qIHMk4GjWBN5L1/7CcsupWSv26OiqmFN9dH9yAOhR33mxVPX4MO	EMPLOYEE	t	t	2026-08-22 10:30:19.764352+05:30	2026-08-22 10:30:19.764352+05:30
7	arjun@dayflow.demo	$2b$10$t4qIHMk4GjWBN5L1/7CcsupWSv26OiqmFN9dH9yAOhR33mxVPX4MO	EMPLOYEE	t	t	2026-08-22 10:30:19.764352+05:30	2026-08-22 10:30:19.764352+05:30
8	sneha@dayflow.demo	$2b$10$t4qIHMk4GjWBN5L1/7CcsupWSv26OiqmFN9dH9yAOhR33mxVPX4MO	EMPLOYEE	t	t	2026-08-22 10:30:19.764352+05:30	2026-08-22 10:30:19.764352+05:30
9	kabir@dayflow.demo	$2b$10$t4qIHMk4GjWBN5L1/7CcsupWSv26OiqmFN9dH9yAOhR33mxVPX4MO	EMPLOYEE	t	t	2026-08-22 10:30:19.764352+05:30	2026-08-22 10:30:19.764352+05:30
10	kavya@dayflow.demo	$2b$10$t4qIHMk4GjWBN5L1/7CcsupWSv26OiqmFN9dH9yAOhR33mxVPX4MO	EMPLOYEE	t	t	2026-08-22 10:30:19.764352+05:30	2026-08-22 10:30:19.764352+05:30
11	rahul@dayflow.demo	$2b$10$t4qIHMk4GjWBN5L1/7CcsupWSv26OiqmFN9dH9yAOhR33mxVPX4MO	EMPLOYEE	t	t	2026-08-22 10:30:19.764352+05:30	2026-08-22 10:30:19.764352+05:30
12	ishita@dayflow.demo	$2b$10$t4qIHMk4GjWBN5L1/7CcsupWSv26OiqmFN9dH9yAOhR33mxVPX4MO	EMPLOYEE	t	t	2026-08-22 10:30:19.764352+05:30	2026-08-22 10:30:19.764352+05:30
13	john.doe.1787378335005@odoo.demo	$2b$10$uXlT/mEYuWF6sbO0pWxcLOZmCpR.9qLpHDeamw/2TYgp.Sw2iedk6	EMPLOYEE	t	t	2026-08-22 11:28:55.008311+05:30	2026-08-22 11:28:55.008311+05:30
14	jane.smith.1787378335143@odoo.demo	$2b$10$TkDZiYewigvl5FVXdiuAfeyly8pVtGBsNSSCgwnjDgYORAsDoNcsO	ADMIN	t	t	2026-08-22 11:28:55.145634+05:30	2026-08-22 11:28:55.145634+05:30
15	john.doe@dayflow.demo	$2b$10$RYSLkkMehzoAiU996rgjx.8SkKy6KM.OPz.tbEFV/16Vzow4BPbpG	EMPLOYEE	t	t	2026-08-22 11:43:25.087881+05:30	2026-08-22 11:43:25.087881+05:30
16	john.doe.1787384731406@odoo.demo	$2b$10$fywmgkcfcIyl3zVgWxUlIuUowlBO/6ixAufb/ks/c9txND9BQl54m	EMPLOYEE	t	t	2026-08-22 13:15:31.408388+05:30	2026-08-22 13:15:31.408388+05:30
17	jane.smith.1787384731539@odoo.demo	$2b$10$1JxK0U/JnhFv3aeK.LLsTObu9VwlLVEmWWnUsIfNQ4W.4euSz8uHO	ADMIN	t	t	2026-08-22 13:15:31.540966+05:30	2026-08-22 13:15:31.540966+05:30
\.


--
-- Name: attendances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.attendances_id_seq', 220, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 41, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.departments_id_seq', 6, true);


--
-- Name: designations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.designations_id_seq', 11, true);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.documents_id_seq', 15, true);


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employees_id_seq', 17, true);


--
-- Name: leaves_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.leaves_id_seq', 12, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: payrolls_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payrolls_id_seq', 20, true);


--
-- Name: salary_structures_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.salary_structures_id_seq', 17, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 17, true);


--
-- Name: attendances attendances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: designations designations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: employees employees_employee_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_employee_code_key UNIQUE (employee_code);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: employees employees_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_id_key UNIQUE (user_id);


--
-- Name: leaves leaves_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: payrolls payrolls_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payrolls
    ADD CONSTRAINT payrolls_pkey PRIMARY KEY (id);


--
-- Name: salary_structures salary_structures_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salary_structures
    ADD CONSTRAINT salary_structures_employee_id_key UNIQUE (employee_id);


--
-- Name: salary_structures salary_structures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salary_structures
    ADD CONSTRAINT salary_structures_pkey PRIMARY KEY (id);


--
-- Name: designations uq_department_designation; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT uq_department_designation UNIQUE (department_id, title);


--
-- Name: attendances uq_employee_attendance_date; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT uq_employee_attendance_date UNIQUE (employee_id, date);


--
-- Name: payrolls uq_employee_payroll_month_year; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payrolls
    ADD CONSTRAINT uq_employee_payroll_month_year UNIQUE (employee_id, month, year);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_attendances_date_range; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attendances_date_range ON public.attendances USING btree (date);


--
-- Name: idx_attendances_employee_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attendances_employee_date ON public.attendances USING btree (employee_id, date);


--
-- Name: idx_attendances_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attendances_status ON public.attendances USING btree (status);


--
-- Name: idx_attendances_status_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attendances_status_date ON public.attendances USING btree (status, date);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at DESC);


--
-- Name: idx_audit_logs_user_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_user_action ON public.audit_logs USING btree (user_id, action);


--
-- Name: idx_documents_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_employee_id ON public.documents USING btree (employee_id);


--
-- Name: idx_employees_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employees_code ON public.employees USING btree (employee_code);


--
-- Name: idx_employees_department; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employees_department ON public.employees USING btree (department_id);


--
-- Name: idx_employees_designation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employees_designation ON public.employees USING btree (designation_id);


--
-- Name: idx_employees_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employees_user_id ON public.employees USING btree (user_id);


--
-- Name: idx_leaves_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leaves_dates ON public.leaves USING btree (start_date, end_date);


--
-- Name: idx_leaves_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leaves_employee_id ON public.leaves USING btree (employee_id);


--
-- Name: idx_leaves_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leaves_status ON public.leaves USING btree (status);


--
-- Name: idx_leaves_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leaves_type ON public.leaves USING btree (leave_type);


--
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at DESC);


--
-- Name: idx_notifications_user_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_unread ON public.notifications USING btree (user_id, is_read);


--
-- Name: idx_payrolls_employee_period; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payrolls_employee_period ON public.payrolls USING btree (employee_id, year, month);


--
-- Name: idx_payrolls_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payrolls_status ON public.payrolls USING btree (payment_status);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: attendances trg_attendances_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_attendances_updated_at BEFORE UPDATE ON public.attendances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: departments trg_departments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: designations trg_designations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_designations_updated_at BEFORE UPDATE ON public.designations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: employees trg_employees_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: leaves trg_leaves_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_leaves_updated_at BEFORE UPDATE ON public.leaves FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: payrolls trg_payrolls_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_payrolls_updated_at BEFORE UPDATE ON public.payrolls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: salary_structures trg_salary_structures_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_salary_structures_updated_at BEFORE UPDATE ON public.salary_structures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users trg_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: attendances attendances_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: designations designations_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: documents documents_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employees employees_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE RESTRICT;


--
-- Name: employees employees_designation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_designation_id_fkey FOREIGN KEY (designation_id) REFERENCES public.designations(id) ON DELETE RESTRICT;


--
-- Name: employees employees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: leaves leaves_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: leaves leaves_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payrolls payrolls_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payrolls
    ADD CONSTRAINT payrolls_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: salary_structures salary_structures_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salary_structures
    ADD CONSTRAINT salary_structures_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict QgjyB9SCBbmLWpshLffN1AlNYTxspAa61tGnaKeWmkVJzbLL31QduarKaaDFCZN

