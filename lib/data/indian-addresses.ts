/**
 * Indian Address Data
 * 
 * Provides autocomplete data for Indian addresses including:
 * - States and Union Territories
 * - Major cities by state
 * - Common pincode patterns by city
 */

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

/**
 * Major cities by state for autocomplete
 */
export const CITIES_BY_STATE: Record<string, string[]> = {
  'Andhra Pradesh': [
    'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry',
    'Kakinada', 'Tirupati', 'Anantapur', 'Kadapa', 'Vizianagaram', 'Eluru', 'Ongole'
  ],
  'Arunachal Pradesh': [
    'Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Bomdila', 'Ziro', 'Along'
  ],
  'Assam': [
    'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur',
    'Bongaigaon', 'Dhubri', 'Sivasagar', 'Goalpara', 'Barpeta', 'Karimganj'
  ],
  'Bihar': [
    'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Arrah',
    'Bihar Sharif', 'Katihar', 'Munger', 'Chapra', 'Sasaram', 'Hajipur', 'Siwan'
  ],
  'Chhattisgarh': [
    'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Raigarh',
    'Jagdalpur', 'Ambikapur', 'Dhamtari', 'Chirmiri'
  ],
  'Goa': [
    'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Mormugao'
  ],
  'Gujarat': [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar',
    'Junagadh', 'Gandhidham', 'Anand', 'Navsari', 'Morbi', 'Nadiad', 'Surendranagar',
    'Bharuch', 'Mehsana', 'Bhuj', 'Porbandar', 'Valsad', 'Vapi'
  ],
  'Haryana': [
    'Faridabad', 'Gurgaon', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar',
    'Karnal', 'Sonipat', 'Panchkula', 'Sirsa', 'Bhiwani', 'Jind', 'Bahadurgarh',
    'Rewari', 'Palwal', 'Kaithal', 'Thanesar'
  ],
  'Himachal Pradesh': [
    'Shimla', 'Mandi', 'Solan', 'Dharamshala', 'Bilaspur', 'Kullu', 'Chamba',
    'Hamirpur', 'Una', 'Nahan', 'Palampur'
  ],
  'Jharkhand': [
    'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Hazaribagh', 'Deoghar',
    'Giridih', 'Ramgarh', 'Medininagar', 'Chaibasa', 'Jhumri Telaiya', 'Sahibganj'
  ],
  'Karnataka': [
    'Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davangere',
    'Bellary', 'Bijapur', 'Shimoga', 'Tumkur', 'Raichur', 'Bidar', 'Hospet', 'Udupi',
    'Hassan', 'Chitradurga', 'Gadag', 'Bagalkot', 'Karwar'
  ],
  'Kerala': [
    'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Palakkad', 'Kollam',
    'Kannur', 'Alappuzha', 'Kottayam', 'Pathanamthitta', 'Malappuram', 'Manjeri',
    'Thalassery', 'Ponnani', 'Payyannur'
  ],
  'Madhya Pradesh': [
    'Indore', 'Bhopal', 'Gwalior', 'Jabalpur', 'Raipur', 'Ujjain', 'Sagar',
    'Ratlam', 'Satna', 'Murwara', 'Rewa', 'Burhanpur', 'Khandwa', 'Morena',
    'Bhind', 'Chhindwara', 'Guna', 'Shivpuri', 'Vidisha', 'Mandsaur'
  ],
  'Maharashtra': [
    'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur',
    'Amravati', 'Kolhapur', 'Nanded', 'Sangli', 'Jalgaon', 'Akola', 'Latur',
    'Ahmednagar', 'Chandrapur', 'Parbhani', 'Ichalkaranji', 'Jalna', 'Bhusawal',
    'Panvel', 'Satara', 'Beed', 'Yavatmal', 'Kamptee', 'Gondia', 'Barshi',
    'Achalpur', 'Osmanabad', 'Nandurbar', 'Wardha', 'Udgir', 'Hinganghat'
  ],
  'Manipur': [
    'Imphal', 'Thoubal', 'Kakching', 'Lilong', 'Mayang Imphal', 'Yairipok'
  ],
  'Meghalaya': [
    'Shillong', 'Tura', 'Nongstoin', 'Jowai', 'Nongpoh', 'Williamnagar'
  ],
  'Mizoram': [
    'Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Kolasib', 'Serchhip'
  ],
  'Nagaland': [
    'Dimapur', 'Kohima', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto'
  ],
  'Odisha': [
    'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri',
    'Baleshwar', 'Bhadrak', 'Baripada', 'Balangir', 'Jharsuguda', 'Rayagada',
    'Bargarh', 'Paradip', 'Bhawanipatna', 'Dhenkanal', 'Barbil', 'Kendujhar',
    'Jagatsinghpur', 'Boudh', 'Phulabani', 'Gopalpur'
  ],
  'Punjab': [
    'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Pathankot',
    'Hoshiarpur', 'Batala', 'Moga', 'Abohar', 'Malerkotla', 'Khanna', 'Mohali',
    'Barnala', 'Firozpur', 'Phagwara', 'Kapurthala', 'Zirakpur', 'Rajpura',
    'Fazilka', 'Gurdaspur', 'Kharar', 'Gobindgarh', 'Muktsar', 'Malout'
  ],
  'Rajasthan': [
    'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara',
    'Alwar', 'Bharatpur', 'Sri Ganganagar', 'Sikar', 'Tonk', 'Pali', 'Banswara',
    'Barmer', 'Chittorgarh', 'Churu', 'Dholpur', 'Dungarpur', 'Hanumangarh',
    'Jaisalmer', 'Jalor', 'Jhalawar', 'Jhunjhunu', 'Karauli', 'Nagaur', 'Rajsamand',
    'Sawai Madhopur', 'Sirohi', 'Baran', 'Dausa', 'Pratapgarh'
  ],
  'Sikkim': [
    'Gangtok', 'Namchi', 'Mangan', 'Gyalshing', 'Singtam', 'Rangpo'
  ],
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli',
    'Erode', 'Vellore', 'Dindigul', 'Thanjavur', 'Tuticorin', 'Kanchipuram',
    'Nagercoil', 'Karur', 'Udhagamandalam', 'Hosur', 'Neyveli', 'Kumbakonam',
    'Tiruvannamalai', 'Pollachi', 'Rajapalayam', 'Gudiyatham', 'Pudukkottai',
    'Dharmapuri', 'Nagapattinam', 'Thiruvallur', 'Tindivanam', 'Palani',
    'Pattukkottai', 'Sivakasi', 'Karaikudi', 'Udagamandalam', 'Paramakudi'
  ],
  'Telangana': [
    'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Ramagundam', 'Khammam',
    'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Siddipet', 'Suryapet', 'Miryalaguda',
    'Jagtial', 'Mancherial', 'Nirmal', 'Kamareddy', 'Kothagudem', 'Bhongir',
    'Bodhan', 'Palwancha', 'Zaheerabad', 'Sangareddy', 'Medak', 'Narayanpet'
  ],
  'Tripura': [
    'Agartala', 'Udaipur', 'Dharmanagar', 'Pratapgarh', 'Kailasahar', 'Belonia',
    'Khowai', 'Teliamura'
  ],
  'Uttar Pradesh': [
    'Lucknow', 'Kanpur', 'Agra', 'Meerut', 'Varanasi', 'Allahabad', 'Bareilly',
    'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad',
    'Lakhimpur', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Rampur', 'Shahjahanpur',
    'Farrukhabad', 'Fatehpur', 'Budaun', 'Sitapur', 'Hapur', 'Unnao', 'Pilibhit',
    'Lalitpur', 'Bahraich', 'Etawah', 'Mirzapur', 'Bulandshahr', 'Sambhal',
    'Hardoi', 'Firozpur', 'Mainpuri', 'Banda', 'Etah', 'Jaunpur', 'Orai',
    'Faizabad', 'Mau', 'Ghazipur', 'Sultanpur', 'Azamgarh', 'Bijnor', 'Basti',
    'Deoria', 'Chandauli', 'Bhadohi', 'Gonda', 'Barabanki', 'Bahraich', 'Khurja',
    'Modinagar', 'Hathras', 'Shamli', 'Bisalpur', 'Kairana', 'Kannauj', 'Kasganj'
  ],
  'Uttarakhand': [
    'Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur',
    'Rishikesh', 'Ramnagar', 'Pithoragarh', 'Manglaur', 'Nainital', 'Mussoorie',
    'Kotdwara', 'Srinagar', 'Tehri', 'Almora', 'Gopeshwar', 'Chamoli', 'Bageshwar'
  ],
  'West Bengal': [
    'Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda',
    'Baharampur', 'Habra', 'Kharagpur', 'Shantipur', 'Ranaghat', 'Haldia',
    'Raiganj', 'Krishnanagar', 'Nabadwip', 'Medinipur', 'Jalpaiguri', 'Balurghat',
    'Basirhat', 'Bankura', 'Chinsurah', 'Alipore', 'Barrackpore', 'Darjeeling',
    'Kalimpong', 'Jalpaiguri', 'Cooch Behar', 'Berhampore', 'Purulia', 'Katwa'
  ],
  'Andaman and Nicobar Islands': [
    'Port Blair', 'Garacharma', 'Bamboo Flat'
  ],
  'Chandigarh': [
    'Chandigarh'
  ],
  'Dadra and Nagar Haveli and Daman and Diu': [
    'Silvassa', 'Daman', 'Diu'
  ],
  'Delhi': [
    'New Delhi', 'Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi',
    'Central Delhi', 'North East Delhi', 'North West Delhi', 'South East Delhi',
    'South West Delhi', 'Shahdara', 'Rohini', 'Dwarka', 'Pitampura', 'Laxmi Nagar'
  ],
  'Jammu and Kashmir': [
    'Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore', 'Kathua', 'Udhampur',
    'Poonch', 'Rajouri', 'Kupwara', 'Bandipora', 'Ganderbal', 'Shopian', 'Pulwama',
    'Kulgam', 'Doda', 'Ramban', 'Reasi', 'Samba', 'Kishtwar'
  ],
  'Ladakh': [
    'Leh', 'Kargil', 'Drass', 'Nubra', 'Zanskar'
  ],
  'Lakshadweep': [
    'Kavaratti', 'Agatti', 'Amini', 'Andrott', 'Kadmat', 'Kalpeni', 'Kiltan', 'Minicoy'
  ],
  'Puducherry': [
    'Puducherry', 'Karaikal', 'Mahe', 'Yanam'
  ],
} as const;

/**
 * Get cities for a given state
 */
export function getCitiesByState(state: string): string[] {
  const normalizedState = state.trim();
  const cities = CITIES_BY_STATE[normalizedState];
  return cities || [];
}

/**
 * Get all cities (for search when state is not selected)
 */
export function getAllCities(): string[] {
  return Object.values(CITIES_BY_STATE).flat();
}

/**
 * Get all states
 */
export function getAllStates(): string[] {
  return [...INDIAN_STATES];
}

/**
 * Search cities by query string
 */
export function searchCities(query: string, state?: string): string[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  const cities = state ? getCitiesByState(state) : getAllCities();
  
  return cities
    .filter(city => city.toLowerCase().includes(normalizedQuery))
    .slice(0, 10); // Limit to 10 results
}

/**
 * Search states by query string
 */
export function searchStates(query: string): string[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  return INDIAN_STATES
    .filter(state => state.toLowerCase().includes(normalizedQuery))
    .slice(0, 10); // Limit to 10 results
}
