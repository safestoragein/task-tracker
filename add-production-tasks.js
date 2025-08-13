const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// All production tasks organized by team member
const productionTasks = [
  // Kiran's tasks - Technical Architecture
  {
    assignee_name: "Kiran",
    title: "Claude code - existing code analysis and optimise",
    description: "Analyze existing codebase using Claude and implement optimizations for performance and maintainability",
    priority: "high",
    status: "todo",
    labels: ["Backend", "Enhancement"],
    estimated_hours: 20
  },
  {
    assignee_name: "Kiran", 
    title: "Customer life cycle - end to end walkthrough",
    description: "Create test account and document complete customer journey, capturing all changes needed",
    priority: "high",
    status: "todo",
    labels: ["Documentation", "Research"],
    estimated_hours: 12
  },
  {
    assignee_name: "Kiran",
    title: "New Customer dashboard - live deployment",
    description: "Deploy new customer dashboard to production environment",
    priority: "high", 
    status: "todo",
    labels: ["Frontend", "DevOps"],
    estimated_hours: 8
  },
  {
    assignee_name: "Kiran",
    title: "Tax invoices - credit note and proforma options",
    description: "Implement credit note options and proforma functionality for total payment handling",
    priority: "medium",
    status: "todo", 
    labels: ["Feature", "Payment"],
    estimated_hours: 16
  },
  {
    assignee_name: "Kiran",
    title: "SafeStorage.ae - Dubai website implementation",
    description: "Setup Dubai website with backend integration, CRM tracking, invoices, and city management",
    priority: "high",
    status: "todo",
    labels: ["Frontend", "Backend", "CRM"],
    estimated_hours: 40
  },
  {
    assignee_name: "Kiran", 
    title: "Mobile apps deployment to PlayStore",
    description: "Deploy SafeStorage customer app, WMS app, supervisor app and vendor app to Google Play Store",
    priority: "medium",
    status: "todo",
    labels: ["Mobile", "DevOps"],
    estimated_hours: 12
  },
  {
    assignee_name: "Kiran",
    title: "WMS vs Dashboard customers synchronization",
    description: "Resolve discrepancies between WMS customers and Dashboard customers data",
    priority: "medium",
    status: "todo",
    labels: ["Backend", "Bug"],
    estimated_hours: 8
  },
  {
    assignee_name: "Kiran",
    title: "AWS migration and Git+Jenkins workflow",
    description: "Complete AWS infrastructure migration and establish Git+Jenkins CI/CD workflow",
    priority: "high",
    status: "todo",
    labels: ["DevOps", "Backend"],
    estimated_hours: 32
  },
  {
    assignee_name: "Kiran",
    title: "WMS - Handle packing material",
    description: "Implement packing material management functionality in WMS",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "Backend"],
    estimated_hours: 12
  },
  {
    assignee_name: "Kiran",
    title: "WMS - Maintenance tasks module",
    description: "Develop maintenance tasks tracking and management in WMS",
    priority: "medium", 
    status: "todo",
    labels: ["Feature", "Backend"],
    estimated_hours: 16
  },
  {
    assignee_name: "Kiran",
    title: "WMS - Attendance system",
    description: "Implement attendance tracking system in WMS",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "Backend"],
    estimated_hours: 10
  },
  {
    assignee_name: "Kiran",
    title: "Optimize booking report loading time",
    description: "Improve booking report performance to reduce loading time significantly",
    priority: "high",
    status: "todo",
    labels: ["Enhancement", "Backend"],
    estimated_hours: 8
  },
  {
    assignee_name: "Kiran",
    title: "Repeated customers handling system",
    description: "Implement system to better handle and track repeated customers",
    priority: "medium",
    status: "todo", 
    labels: ["Feature", "CRM"],
    estimated_hours: 12
  },
  {
    assignee_name: "Kiran",
    title: "Damages display dashboard - pre-booking retrieval",
    description: "Display damage points on dashboard before booking retrieval to inform customers",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "Frontend"],
    estimated_hours: 8
  },

  // Kushal's tasks - Business and Technology
  {
    assignee_name: "Kushal",
    title: "SafeStorage Payment detailed analysis",
    description: "Conduct comprehensive analysis of payment systems and transactions",
    priority: "high",
    status: "todo",
    labels: ["Analytics", "Payment"],
    estimated_hours: 12
  },
  {
    assignee_name: "Kushal",
    title: "SafeStorage anniversary video production",
    description: "Create and produce anniversary celebration video for SafeStorage",
    priority: "low",
    status: "todo", 
    labels: ["Marketing"],
    estimated_hours: 16
  },
  {
    assignee_name: "Kushal",
    title: "LinkedIn Ads Setup",
    description: "Setup LinkedIn advertising campaigns (waiting for creative assets)",
    priority: "medium",
    status: "todo",
    labels: ["Marketing"],
    estimated_hours: 6
  },
  {
    assignee_name: "Kushal", 
    title: "TMDHosting - reduce storage space",
    description: "Optimize and reduce hosting storage space requirements with TMDHosting",
    priority: "medium",
    status: "todo",
    labels: ["DevOps"],
    estimated_hours: 4
  },
  {
    assignee_name: "Kushal",
    title: "SafeStorage.in - website changes",
    description: "Implement requested changes and improvements to main SafeStorage.in website",
    priority: "high",
    status: "todo",
    labels: ["Frontend", "Enhancement"],
    estimated_hours: 16
  },
  {
    assignee_name: "Kushal",
    title: "Business Customer management improvements",
    description: "Total list, partial retrieval option, and missing invoices handling for business customers",
    priority: "high",
    status: "todo",
    labels: ["Feature", "CRM"],
    estimated_hours: 20
  },
  {
    assignee_name: "Kushal",
    title: "Second page quotation system",
    description: "Implement second page quotation functionality",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "CRM"],
    estimated_hours: 8
  },
  {
    assignee_name: "Kushal",
    title: "SafeStorage CRM - Agentic platform",
    description: "Develop AI-powered CRM platform with performance-based lead distribution and source analysis",
    priority: "high", 
    status: "todo",
    labels: ["CRM", "Feature", "Backend"],
    estimated_hours: 40
  },
  {
    assignee_name: "Kushal",
    title: "WhatsApp bots support integration",
    description: "Implement WhatsApp bot support for customer service automation",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "Backend"],
    estimated_hours: 16
  },
  {
    assignee_name: "Kushal",
    title: "KYC and Insurance value update system",
    description: "Implement mandatory KYC and insurance value updates on customer dashboard",
    priority: "high",
    status: "todo",
    labels: ["Feature", "Legal"],
    estimated_hours: 12
  },
  {
    assignee_name: "Kushal",
    title: "Knowlarity recording integration",
    description: "Add Knowlarity recording for pickup confirmation calls with standard points, KYC, insurance value and feedback collection",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "CRM"],
    estimated_hours: 10
  },
  {
    assignee_name: "Kushal", 
    title: "Remove huge discounts - implement surge pricing",
    description: "Remove excessive discounts and implement standard pricing with weekend surge pricing",
    priority: "high",
    status: "todo",
    labels: ["Enhancement", "Payment"],
    estimated_hours: 8
  },
  {
    assignee_name: "Kushal",
    title: "Customer WhatsApp messaging and incentives",
    description: "Setup customer WhatsApp message circulation system with incentive programs",
    priority: "medium",
    status: "todo",
    labels: ["Marketing", "Feature"],
    estimated_hours: 12
  },
  {
    assignee_name: "Kushal",
    title: "Warehouse video call and visit scheduling",
    description: "Add warehouse video call and schedule warehouse visit options in CRM",
    priority: "medium", 
    status: "todo",
    labels: ["Feature", "CRM"],
    estimated_hours: 10
  },
  {
    assignee_name: "Kushal",
    title: "Stownest traffic analysis",
    description: "Analyze why customers are choosing Stownest over SafeStorage - 570 missing keywords analysis",
    priority: "high",
    status: "todo",
    labels: ["Research", "Marketing"],
    estimated_hours: 16
  },
  {
    assignee_name: "Kushal",
    title: "SafeStorage ads improvement",
    description: "Improve SafeStorage ad attractiveness compared to competitors like Stownest",
    priority: "high", 
    status: "todo",
    labels: ["Marketing", "Enhancement"],
    estimated_hours: 12
  },
  {
    assignee_name: "Kushal",
    title: "Free transport strategy for high-demand areas",
    description: "Implement strategy for free transport in high-demand customer areas",
    priority: "medium",
    status: "todo",
    labels: ["Marketing", "Logistics"],
    estimated_hours: 6
  },
  {
    assignee_name: "Kushal",
    title: "Next day and month-end retrieval pricing",
    description: "Implement next day retrieval (+2000) and month end retrieval (+2000) pricing",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "Payment"], 
    estimated_hours: 8
  },
  {
    assignee_name: "Kushal",
    title: "SafeStorage global website",
    description: "Develop global SafeStorage website for international markets",
    priority: "medium",
    status: "todo",
    labels: ["Frontend", "Marketing"],
    estimated_hours: 32
  },
  {
    assignee_name: "Kushal",
    title: "Home Triangle onboarding",
    description: "Complete onboarding process with Home Triangle partnership",
    priority: "low",
    status: "todo",
    labels: ["Research"],
    estimated_hours: 8
  },

  // Anush's tasks - Logistics and Operations
  {
    assignee_name: "Anush",
    title: "Kolkata warehouse confirmation",
    description: "Finalize and confirm Kolkata warehouse location and agreements",
    priority: "high",
    status: "todo",
    labels: ["Logistics"],
    estimated_hours: 8
  },
  {
    assignee_name: "Anush",
    title: "Jaipur warehouse confirmation", 
    description: "Finalize and confirm Jaipur warehouse location and agreements",
    priority: "high",
    status: "todo",
    labels: ["Logistics"],
    estimated_hours: 8
  },
  {
    assignee_name: "Anush",
    title: "Noida warehouse confirmation",
    description: "Finalize and confirm Noida warehouse location and agreements", 
    priority: "high",
    status: "todo",
    labels: ["Logistics"],
    estimated_hours: 8
  },
  {
    assignee_name: "Anush",
    title: "Porter agreement finalization",
    description: "Complete and finalize agreement with Porter for logistics services",
    priority: "high",
    status: "todo",
    labels: ["Logistics", "Legal"],
    estimated_hours: 6
  },
  {
    assignee_name: "Anush",
    title: "SSTP P&L analysis",
    description: "Analyze SafeStorage Transport Partners profit and loss statements",
    priority: "medium",
    status: "todo",
    labels: ["Analytics", "Logistics"],
    estimated_hours: 6
  },
  {
    assignee_name: "Anush",
    title: "Cityfurnish business status review",
    description: "Review and assess current status of Cityfurnish business partnership",
    priority: "medium", 
    status: "todo",
    labels: ["Research"],
    estimated_hours: 4
  },
  {
    assignee_name: "Anush", 
    title: "Vendor agreement confirmation",
    description: "Confirm and finalize agreements with all vendors",
    priority: "high",
    status: "todo",
    labels: ["Logistics", "Legal"],
    estimated_hours: 8
  },
  {
    assignee_name: "Anush",
    title: "Vendor vehicle branding",
    description: "Implement branding on all vendor vehicles",
    priority: "medium",
    status: "todo",
    labels: ["Marketing", "Logistics"],
    estimated_hours: 10
  },
  {
    assignee_name: "Anush",
    title: "Crush paper implementation for fragile items",
    description: "Implement crush paper packaging for fragile items protection",
    priority: "medium",
    status: "todo",
    labels: ["Logistics", "Enhancement"],
    estimated_hours: 6
  },
  {
    assignee_name: "Anush",
    title: "Packing material branding",
    description: "Implement SafeStorage branding on all packing materials",
    priority: "medium",
    status: "todo", 
    labels: ["Marketing", "Logistics"],
    estimated_hours: 8
  },
  {
    assignee_name: "Anush",
    title: "Send back 6-meter Stacker",
    description: "Return 6-meter stacker equipment to supplier",
    priority: "low",
    status: "todo",
    labels: ["Logistics"],
    estimated_hours: 2
  },
  {
    assignee_name: "Anush",
    title: "Pune owner legal notice",
    description: "Handle legal notice proceedings with Pune warehouse owner",
    priority: "high",
    status: "todo",
    labels: ["Legal"],
    estimated_hours: 12
  },

  // Niranjan's tasks - Operations and QA
  {
    assignee_name: "Niranjan",
    title: "Warehouse branding boards design",
    description: "Design and implement branding boards for all warehouses",
    priority: "medium",
    status: "todo",
    labels: ["Marketing"],
    estimated_hours: 8
  },
  {
    assignee_name: "Niranjan",
    title: "Fire safety and smoke detectors installation",
    description: "Install fire safety equipment and smoke detectors in all warehouses",
    priority: "high",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 12
  },
  {
    assignee_name: "Niranjan",
    title: "CCTV footage online access",
    description: "Setup online access system for CCTV footage monitoring",
    priority: "high", 
    status: "todo",
    labels: ["Feature", "Backend"],
    estimated_hours: 10
  },
  {
    assignee_name: "Niranjan",
    title: "Labour and GST certificates for warehouses",
    description: "Obtain and maintain labour and GST certificates for all warehouse locations",
    priority: "high",
    status: "todo",
    labels: ["Legal"],
    estimated_hours: 8
  },
  {
    assignee_name: "Niranjan",
    title: "Self Storage units setup",
    description: "Setup and configure self storage units system",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "Logistics"],
    estimated_hours: 16
  },
  {
    assignee_name: "Niranjan", 
    title: "Update warehouse locations in dashboard",
    description: "Update all warehouse location information in the dashboard system",
    priority: "medium",
    status: "todo",
    labels: ["Enhancement", "Backend"],
    estimated_hours: 6
  },
  {
    assignee_name: "Niranjan",
    title: "Report damage 24-hour disable feature",
    description: "Implement 24-hour auto-disable feature for damage reporting",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "Backend"],
    estimated_hours: 8
  },
  {
    assignee_name: "Niranjan",
    title: "Insurance value and goods declaration system",
    description: "Implement insurance value tracking and declared goods system for Glass, Marble items",
    priority: "high",
    status: "todo",
    labels: ["Feature", "Legal"],
    estimated_hours: 12
  },
  {
    assignee_name: "Niranjan",
    title: "Packers and Movers intercity orders",
    description: "Setup packers and movers system for intercity order management",
    priority: "medium",
    status: "todo", 
    labels: ["Feature", "Logistics"],
    estimated_hours: 16
  },
  {
    assignee_name: "Niranjan",
    title: "Pending instant payments and inventory updates",
    description: "Resolve pending instant payment issues and update inventory systems",
    priority: "high",
    status: "todo",
    labels: ["Bug", "Payment"],
    estimated_hours: 10
  },
  {
    assignee_name: "Niranjan",
    title: "Intercity and Shifting data reports",
    description: "Setup comprehensive reporting for intercity and shifting data handling",
    priority: "medium",
    status: "todo",
    labels: ["Analytics", "Backend"],
    estimated_hours: 8
  },
  {
    assignee_name: "Niranjan",
    title: "Airtel leased line bills and address change",
    description: "Handle Airtel leased line billing and process address changes",
    priority: "low",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 4
  },
  {
    assignee_name: "Niranjan",
    title: "SG5 WiFi boosters installation", 
    description: "Install WiFi signal boosters at SG5 facility",
    priority: "medium",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 4
  },
  {
    assignee_name: "Niranjan",
    title: "SG5 UPS issue resolution",
    description: "Diagnose and resolve UPS power issues at SG5 facility",
    priority: "high",
    status: "todo",
    labels: ["Bug"],
    estimated_hours: 6
  },
  {
    assignee_name: "Niranjan",
    title: "Damage request form - 24hr expiry",
    description: "Enable damage request form after retrieval with 24-hour expiry option",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "Frontend"],
    estimated_hours: 8
  },
  {
    assignee_name: "Niranjan",
    title: "Transport app link testing",
    description: "Test and validate transport app linking functionality",
    priority: "medium",
    status: "todo", 
    labels: ["Mobile", "Bug"],
    estimated_hours: 4
  },
  {
    assignee_name: "Niranjan",
    title: "Display terms while booking retrieval",
    description: "Implement terms and conditions display during retrieval booking process",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "Frontend"],
    estimated_hours: 6
  },
  {
    assignee_name: "Niranjan",
    title: "Chennai CCTV installation",
    description: "Install and setup CCTV system at Chennai warehouse",
    priority: "medium",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 8
  },
  {
    assignee_name: "Niranjan",
    title: "UK warehouse analysis",
    description: "Conduct comprehensive analysis of UK warehouse operations and requirements",
    priority: "low",
    status: "todo",
    labels: ["Research", "Analytics"],
    estimated_hours: 12
  },
  {
    assignee_name: "Niranjan",
    title: "Fix partial retrieval charges display",
    description: "Fix issue where partial retrieval charges are not reflecting correctly", 
    priority: "high",
    status: "todo",
    labels: ["Bug", "Payment"],
    estimated_hours: 6
  },
  {
    assignee_name: "Niranjan",
    title: "Biometric device installation",
    description: "Install biometric attendance devices at all facilities",
    priority: "medium",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 10
  },
  {
    assignee_name: "Niranjan",
    title: "WMS outbound modify order functionality",
    description: "Implement modify order functionality for WMS outbound operations",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "Backend"],
    estimated_hours: 12
  },
  {
    assignee_name: "Niranjan",
    title: "WMS warehouse names API integration",
    description: "Implement API-based warehouse name fetching instead of static names in WMS",
    priority: "medium",
    status: "todo",
    labels: ["Enhancement", "Backend"], 
    estimated_hours: 8
  },
  {
    assignee_name: "Niranjan",
    title: "Two-way pickup-retrieval customer request flow",
    description: "Implement two-way flow for pickup → retrieval → customer request process",
    priority: "high",
    status: "todo",
    labels: ["Feature", "Backend"],
    estimated_hours: 16
  },

  // Harsha's tasks - Facility Management
  {
    assignee_name: "Harsha",
    title: "Fix SG3 water leakages - Bangalore",
    description: "Address and repair water leakage issues at SG3 Bangalore facility",
    priority: "high", 
    status: "todo",
    labels: ["Bug", "Logistics"],
    estimated_hours: 8
  },
  {
    assignee_name: "Harsha",
    title: "Set up digital room - SG5 Bangalore",
    description: "Setup digital room infrastructure at SG5 Bangalore facility",
    priority: "medium",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 12
  },
  {
    assignee_name: "Harsha",
    title: "Open bank accounts for employees - All cities",
    description: "Setup bank accounts for employees across all city operations",
    priority: "medium",
    status: "todo",
    labels: ["Legal"],
    estimated_hours: 16
  },
  {
    assignee_name: "Harsha",
    title: "Build office cabin - SG5 Bangalore",
    description: "Construct office cabin at SG5 Bangalore facility",
    priority: "medium",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 20
  },
  {
    assignee_name: "Harsha", 
    title: "Install signal boosters - SG5 Bangalore",
    description: "Install mobile signal boosters at SG5 Bangalore facility",
    priority: "medium",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 6,
    due_date: "2025-09-05"
  },
  {
    assignee_name: "Harsha",
    title: "Install big boards - SG5 Bangalore",
    description: "Install large signage boards at SG5 Bangalore facility",
    priority: "medium",
    status: "todo", 
    labels: ["Marketing"],
    estimated_hours: 8
  },
  {
    assignee_name: "Harsha",
    title: "Add SG5 location to Google Maps - Bangalore",
    description: "Register SG5 Bangalore location on Google Maps for customer access",
    priority: "medium",
    status: "todo",
    labels: ["Marketing"],
    estimated_hours: 2
  },
  {
    assignee_name: "Harsha",
    title: "Sell vehicle TN12AP7683 - Chennai",
    description: "Complete sale of vehicle TN12AP7683 in Chennai",
    priority: "low",
    status: "todo",
    labels: ["Logistics"],
    estimated_hours: 4
  },
  {
    assignee_name: "Harsha",
    title: "Sell vehicles - Bangalore",
    description: "Complete sale of designated vehicles in Bangalore operations",
    priority: "low", 
    status: "todo",
    labels: ["Logistics"],
    estimated_hours: 8
  },
  {
    assignee_name: "Harsha",
    title: "Install CCTV - Mumbai",
    description: "Install comprehensive CCTV system at Mumbai facility",
    priority: "high",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 10
  },
  {
    assignee_name: "Harsha",
    title: "Add location to Google Maps - Mumbai",
    description: "Register Mumbai facility location on Google Maps",
    priority: "medium",
    status: "todo",
    labels: ["Marketing"],
    estimated_hours: 2
  },
  {
    assignee_name: "Harsha",
    title: "Change GST address - Mumbai",
    description: "Update GST registration address for Mumbai operations",
    priority: "high",
    status: "todo",
    labels: ["Legal"], 
    estimated_hours: 4
  },
  {
    assignee_name: "Harsha",
    title: "Install smoke detectors and fire extinguishers - Mumbai",
    description: "Install complete fire safety equipment at Mumbai facility",
    priority: "high",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 8
  },
  {
    assignee_name: "Harsha",
    title: "Install fire extinguishers and smoke detectors - Delhi",
    description: "Install fire safety equipment at Delhi facility",
    priority: "high",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 8
  },
  {
    assignee_name: "Harsha",
    title: "Install fire cylinders and smoke detectors - Coimbatore",
    description: "Install fire safety equipment at Coimbatore facility", 
    priority: "high",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 8
  },
  {
    assignee_name: "Harsha",
    title: "Complete GST registration - Coimbatore",
    description: "Complete GST registration process for Coimbatore operations",
    priority: "high",
    status: "todo",
    labels: ["Legal"],
    estimated_hours: 6
  },
  {
    assignee_name: "Harsha",
    title: "Purchase pallets - Coimbatore",
    description: "Purchase required pallets for Coimbatore warehouse operations",
    priority: "medium",
    status: "todo",
    labels: ["Logistics"],
    estimated_hours: 4
  },
  {
    assignee_name: "Harsha",
    title: "Implement QR code system - All cities",
    description: "Implement QR code tracking system across all city operations",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "Enhancement"], 
    estimated_hours: 20
  },
  {
    assignee_name: "Harsha",
    title: "Build mezzanine - SG5 Bangalore",
    description: "Construct mezzanine level at SG5 Bangalore for additional storage",
    priority: "medium",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 40
  },
  {
    assignee_name: "Harsha",
    title: "Purchase office furniture - Bangalore",
    description: "Purchase required office furniture for Bangalore operations",
    priority: "low",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 6
  },
  {
    assignee_name: "Harsha",
    title: "Transfer racks to Bangalore from Mumbai",
    description: "Coordinate transfer of storage racks from Mumbai to Bangalore",
    priority: "medium",
    status: "todo", 
    labels: ["Logistics"],
    estimated_hours: 8
  },
  {
    assignee_name: "Harsha",
    title: "Transfer racks to Pune from Mumbai",
    description: "Coordinate transfer of storage racks from Mumbai to Pune",
    priority: "medium",
    status: "todo",
    labels: ["Logistics"],
    estimated_hours: 8
  },
  {
    assignee_name: "Harsha",
    title: "Update warehouse layout on WMS - Bangalore All",
    description: "Update warehouse layout information in WMS for all Bangalore facilities",
    priority: "medium",
    status: "todo",
    labels: ["Enhancement", "Backend"],
    estimated_hours: 12
  },
  {
    assignee_name: "Harsha",
    title: "Sell vehicle - Bangalore",
    description: "Complete sale of designated vehicle in Bangalore",
    priority: "low",
    status: "todo",
    labels: ["Logistics"], 
    estimated_hours: 4
  },
  {
    assignee_name: "Harsha",
    title: "Fix warehouse leakages - HY-4 Hyderabad",
    description: "Address and repair warehouse leakage issues at HY-4 Hyderabad facility",
    priority: "high",
    status: "todo",
    labels: ["Bug", "Logistics"],
    estimated_hours: 10
  },
  {
    assignee_name: "Harsha",
    title: "Create accounts for cash salary - Bangalore All",
    description: "Setup cash salary accounts for all Bangalore facility employees",
    priority: "medium",
    status: "todo",
    labels: ["Legal"],
    estimated_hours: 8
  },
  {
    assignee_name: "Harsha",
    title: "Default customers action plan",
    description: "Develop and implement action plan for handling default customers",
    priority: "medium",
    status: "todo",
    labels: ["CRM"], 
    estimated_hours: 8
  },
  {
    assignee_name: "Harsha",
    title: "Video testimonials from warehouse visit customers",
    description: "Collect video testimonials from customers who visit warehouses, featuring SafeStorage branding",
    priority: "low",
    status: "todo",
    labels: ["Marketing"],
    estimated_hours: 12
  }
]

async function addProductionTasks() {
  try {
    console.log('🚀 Adding production tasks to SafeStorage Task Tracker...')
    
    // Get team members and labels
    const { data: teamMembers } = await supabase.from('team_members').select('*')
    const { data: labels } = await supabase.from('labels').select('*')
    
    if (!teamMembers || !labels) {
      console.error('❌ Could not fetch team members or labels')
      return
    }
    
    console.log(`📋 Found ${teamMembers.length} team members and ${labels.length} labels`)
    
    let addedCount = 0
    const tasksByAssignee = {}
    
    for (const task of productionTasks) {
      // Find assignee
      const assignee = teamMembers.find(m => m.name === task.assignee_name)
      if (!assignee) {
        console.warn(`⚠️  Assignee ${task.assignee_name} not found, skipping: ${task.title}`)
        continue
      }
      
      // Map labels
      const taskLabels = task.labels?.map(labelName => {
        return labels.find(l => l.name === labelName)?.name || labelName
      }).filter(Boolean) || []
      
      // Set due date (random within 30-90 days if not specified)
      const dueDate = task.due_date || 
        new Date(Date.now() + (Math.random() * 60 + 30) * 24 * 60 * 60 * 1000).toISOString()
      
      const taskData = {
        title: task.title,
        description: task.description,
        status: task.status || 'todo',
        priority: task.priority || 'medium', 
        assignee_id: assignee.id,
        labels: taskLabels,
        estimated_hours: task.estimated_hours || 8,
        due_date: dueDate
      }
      
      const { error } = await supabase.from('tasks').insert([taskData])
      
      if (error) {
        console.error(`❌ Error adding task "${task.title}":`, error.message)
      } else {
        console.log(`✅ Added: ${task.title} (${task.assignee_name})`)
        addedCount++
        tasksByAssignee[task.assignee_name] = (tasksByAssignee[task.assignee_name] || 0) + 1
      }
    }
    
    // Final statistics
    const { data: allTasks } = await supabase.from('tasks').select('*')
    
    console.log(`\n📊 Successfully added ${addedCount} production tasks!`)
    console.log(`📈 Total tasks in database: ${allTasks?.length}`)
    
    console.log('\n👥 Tasks by team member:')
    Object.entries(tasksByAssignee)
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, count]) => {
        console.log(`  ${name}: ${count} tasks`)
      })
    
    // Status breakdown
    const statusCounts = {}
    allTasks?.forEach(task => {
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1
    })
    
    console.log('\n📊 Tasks by status:')
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} tasks`)
    })
    
    console.log('\n🎉 Production tasks successfully loaded into SafeStorage Task Tracker!')
    console.log('🔗 View live: https://task-tracker-5xh0p21rn-safestoragein-gmailcoms-projects.vercel.app')
    
  } catch (error) {
    console.error('❌ Failed to add production tasks:', error)
  }
}

addProductionTasks()