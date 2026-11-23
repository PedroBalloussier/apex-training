# Gera data/exercises.json. Colunas:
# id | pt | en | muscle | region | pattern | type(c/i) | equipment | level(1-3) | contra(csv) | unilateral(0/1)
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from muscle_map import muscles_for
R = """
bb_bench_press|Supino reto com barra|Barbell bench press|chest|middle|horizontal_push|c|barbell|2|shoulder|0
db_bench_press|Supino reto com halteres|Dumbbell bench press|chest|middle|horizontal_push|c|dumbbell|1|shoulder|0
machine_chest_press|Supino na máquina|Machine chest press|chest|middle|horizontal_push|c|machine|1||0
smith_bench_press|Supino reto no Smith|Smith machine bench press|chest|middle|horizontal_push|c|smith|1|shoulder|0
push_up|Flexão de braço|Push-up|chest|middle|horizontal_push|c|bodyweight|1|wrist|0
bb_incline_press|Supino inclinado com barra|Incline barbell bench press|chest|upper|horizontal_push|c|barbell|2|shoulder|0
db_incline_press|Supino inclinado com halteres|Incline dumbbell press|chest|upper|horizontal_push|c|dumbbell|1|shoulder|0
machine_incline_press|Supino inclinado na máquina|Incline machine press|chest|upper|horizontal_push|c|machine|1||0
smith_incline_press|Supino inclinado no Smith|Smith incline press|chest|upper|horizontal_push|c|smith|1|shoulder|0
decline_push_up|Flexão com pés elevados|Feet-elevated push-up|chest|upper|horizontal_push|c|bodyweight|2|wrist|0
bb_decline_press|Supino declinado com barra|Decline barbell bench press|chest|lower|horizontal_push|c|barbell|2|shoulder|0
db_decline_press|Supino declinado com halteres|Decline dumbbell press|chest|lower|horizontal_push|c|dumbbell|2|shoulder|0
chest_dip|Paralelas (foco no peito)|Chest dip|chest|lower|horizontal_push|c|dip_bars|2|shoulder|0
db_fly|Crucifixo reto com halteres|Dumbbell fly|chest|middle|fly|i|dumbbell|1|shoulder|0
pec_deck|Crucifixo na máquina (peck deck)|Pec deck fly|chest|middle|fly|i|machine|1||0
cable_crossover|Crossover na polia|Cable crossover|chest|middle|fly|i|cable|1||0
incline_db_fly|Crucifixo inclinado com halteres|Incline dumbbell fly|chest|upper|fly|i|dumbbell|1|shoulder|0
low_cable_fly|Crossover de baixo para cima|Low-to-high cable fly|chest|upper|fly|i|cable|1||0
high_cable_fly|Crossover de cima para baixo|High-to-low cable fly|chest|lower|fly|i|cable|1||0
pullover_db|Pullover com halter|Dumbbell pullover|chest|middle|pullover|i|dumbbell|2|shoulder|0
pull_up|Barra fixa pronada|Pull-up|back|lats|vertical_pull|c|pullup_bar|2|shoulder|0
chin_up|Barra fixa supinada|Chin-up|back|lats|vertical_pull|c|pullup_bar|2|elbow|0
lat_pulldown|Puxada frontal na polia|Lat pulldown|back|lats|vertical_pull|c|cable|1||0
close_grip_pulldown|Puxada com triângulo|Close-grip lat pulldown|back|lats|vertical_pull|c|cable|1||0
machine_pulldown|Puxada na máquina articulada|Machine lat pulldown|back|lats|vertical_pull|c|machine|1||0
assisted_pull_up|Barra fixa assistida|Assisted pull-up|back|lats|vertical_pull|c|machine|1||0
band_pulldown|Puxada com elástico|Band lat pulldown|back|lats|vertical_pull|c|band|1||0
straight_arm_pulldown|Pulldown com braços estendidos|Straight-arm pulldown|back|lats|pullover|i|cable|1||0
bb_row|Remada curvada com barra|Barbell bent-over row|back|upper|horizontal_pull|c|barbell|2|lower_back|0
db_row|Remada unilateral com halter (serrote)|One-arm dumbbell row|back|upper|horizontal_pull|c|dumbbell|1||1
seated_cable_row|Remada sentada na polia|Seated cable row|back|upper|horizontal_pull|c|cable|1||0
machine_row|Remada na máquina|Machine row|back|upper|horizontal_pull|c|machine|1||0
t_bar_row|Remada cavalinho|T-bar row|back|upper|horizontal_pull|c|barbell|2|lower_back|0
chest_supported_row|Remada apoiada no banco inclinado|Chest-supported dumbbell row|back|upper|horizontal_pull|c|dumbbell|1||0
inverted_row|Remada invertida|Inverted row|back|upper|horizontal_pull|c|bodyweight|1||0
band_row|Remada com elástico|Band row|back|upper|horizontal_pull|c|band|1||0
pendlay_row|Remada Pendlay|Pendlay row|back|upper|horizontal_pull|c|barbell|3|lower_back|0
back_extension|Extensão lombar no banco romano|Back extension|back|lower|hinge|i|bodyweight|1|lower_back|0
superman|Superman no solo|Superman hold|back|lower|hinge|i|bodyweight|1||0
bb_shrug|Encolhimento com barra|Barbell shrug|back|traps|shrug|i|barbell|1||0
db_shrug|Encolhimento com halteres|Dumbbell shrug|back|traps|shrug|i|dumbbell|1||0
bb_ohp|Desenvolvimento militar com barra|Barbell overhead press|shoulders|front|vertical_push|c|barbell|2|shoulder,lower_back|0
db_shoulder_press|Desenvolvimento com halteres|Dumbbell shoulder press|shoulders|front|vertical_push|c|dumbbell|1|shoulder|0
machine_shoulder_press|Desenvolvimento na máquina|Machine shoulder press|shoulders|front|vertical_push|c|machine|1||0
smith_shoulder_press|Desenvolvimento no Smith|Smith shoulder press|shoulders|front|vertical_push|c|smith|1|shoulder|0
arnold_press|Desenvolvimento Arnold|Arnold press|shoulders|front|vertical_push|c|dumbbell|2|shoulder|0
pike_push_up|Flexão pike|Pike push-up|shoulders|front|vertical_push|c|bodyweight|2|wrist,shoulder|0
landmine_press|Desenvolvimento landmine|Landmine press|shoulders|front|vertical_push|c|barbell|1||1
front_raise_db|Elevação frontal com halteres|Dumbbell front raise|shoulders|front|front_raise|i|dumbbell|1|shoulder|0
front_raise_cable|Elevação frontal na polia|Cable front raise|shoulders|front|front_raise|i|cable|1||0
lateral_raise_db|Elevação lateral com halteres|Dumbbell lateral raise|shoulders|side|lateral_raise|i|dumbbell|1||0
lateral_raise_cable|Elevação lateral na polia|Cable lateral raise|shoulders|side|lateral_raise|i|cable|1||1
lateral_raise_machine|Elevação lateral na máquina|Machine lateral raise|shoulders|side|lateral_raise|i|machine|1||0
lateral_raise_band|Elevação lateral com elástico|Band lateral raise|shoulders|side|lateral_raise|i|band|1||0
upright_row|Remada alta|Upright row|shoulders|side|lateral_raise|c|barbell|2|shoulder|0
reverse_pec_deck|Crucifixo inverso na máquina|Reverse pec deck|shoulders|rear|rear_fly|i|machine|1||0
rear_delt_fly_db|Crucifixo inverso com halteres|Bent-over rear delt fly|shoulders|rear|rear_fly|i|dumbbell|1|lower_back|0
face_pull|Face pull na polia|Cable face pull|shoulders|rear|rear_fly|i|cable|1||0
band_pull_apart|Pull-apart com elástico|Band pull-apart|shoulders|rear|rear_fly|i|band|1||0
bb_curl|Rosca direta com barra|Barbell curl|biceps|long|elbow_flexion|i|barbell|1|wrist|0
ez_curl|Rosca direta com barra W|EZ-bar curl|biceps|long|elbow_flexion|i|ez_bar|1||0
db_curl|Rosca alternada com halteres|Alternating dumbbell curl|biceps|long|elbow_flexion|i|dumbbell|1||1
cable_curl|Rosca na polia|Cable curl|biceps|long|elbow_flexion|i|cable|1||0
band_curl|Rosca com elástico|Band curl|biceps|long|elbow_flexion|i|band|1||0
incline_db_curl|Rosca inclinada com halteres|Incline dumbbell curl|biceps|long|elbow_flexion_stretch|i|dumbbell|2|shoulder|0
bayesian_curl|Rosca Bayesian na polia|Bayesian cable curl|biceps|long|elbow_flexion_stretch|i|cable|2||1
preacher_curl|Rosca Scott com barra W|EZ-bar preacher curl|biceps|short|elbow_flexion_short|i|ez_bar|1|elbow|0
machine_preacher_curl|Rosca Scott na máquina|Machine preacher curl|biceps|short|elbow_flexion_short|i|machine|1||0
concentration_curl|Rosca concentrada|Concentration curl|biceps|short|elbow_flexion_short|i|dumbbell|1||1
spider_curl|Rosca spider|Spider curl|biceps|short|elbow_flexion_short|i|dumbbell|2||0
hammer_curl|Rosca martelo|Hammer curl|biceps|brachialis|hammer_curl|i|dumbbell|1||0
cable_rope_hammer|Rosca martelo na polia com corda|Cable rope hammer curl|biceps|brachialis|hammer_curl|i|cable|1||0
close_grip_bench|Supino fechado|Close-grip bench press|triceps|all|elbow_extension_compound|c|barbell|2|shoulder,wrist|0
bench_dip|Mergulho no banco|Bench dip|triceps|all|elbow_extension_compound|c|bodyweight|1|shoulder|0
triceps_dip|Paralelas (foco no tríceps)|Triceps dip|triceps|all|elbow_extension_compound|c|dip_bars|2|shoulder|0
diamond_push_up|Flexão diamante|Diamond push-up|triceps|all|elbow_extension_compound|c|bodyweight|2|wrist|0
machine_dip|Mergulho na máquina|Machine dip|triceps|all|elbow_extension_compound|c|machine|1||0
rope_pushdown|Tríceps na polia com corda|Rope triceps pushdown|triceps|lateral|elbow_extension|i|cable|1||0
bar_pushdown|Tríceps na polia com barra|Bar triceps pushdown|triceps|lateral|elbow_extension|i|cable|1||0
band_pushdown|Tríceps com elástico|Band triceps pushdown|triceps|lateral|elbow_extension|i|band|1||0
db_kickback|Tríceps coice com halter|Dumbbell kickback|triceps|lateral|elbow_extension|i|dumbbell|1||1
skull_crusher|Tríceps testa com barra W|EZ-bar skull crusher|triceps|long|elbow_extension_overhead|i|ez_bar|2|elbow|0
db_overhead_ext|Tríceps francês com halter|Dumbbell overhead extension|triceps|long|elbow_extension_overhead|i|dumbbell|1|shoulder,elbow|0
cable_overhead_ext|Tríceps francês na polia|Cable overhead extension|triceps|long|elbow_extension_overhead|i|cable|1|shoulder|0
french_press_bb|French press com barra|Barbell French press|triceps|long|elbow_extension_overhead|i|barbell|2|shoulder,elbow|0
wrist_curl|Rosca de punho|Wrist curl|forearms|flexors|wrist_flexion|i|barbell|1|wrist|0
db_wrist_curl|Rosca de punho com halteres|Dumbbell wrist curl|forearms|flexors|wrist_flexion|i|dumbbell|1|wrist|0
reverse_wrist_curl|Rosca de punho inversa|Reverse wrist curl|forearms|extensors|wrist_extension|i|dumbbell|1|wrist|0
reverse_curl|Rosca inversa|Reverse curl|forearms|extensors|reverse_curl|i|ez_bar|1|wrist|0
farmer_walk|Caminhada do fazendeiro|Farmer's walk|forearms|grip|carry|c|dumbbell|1||0
dead_hang|Suspensão na barra|Dead hang|forearms|grip|grip_hold|i|pullup_bar|1|shoulder|0
bb_back_squat|Agachamento livre com barra|Barbell back squat|quads|all|squat|c|barbell|2|knee,lower_back|0
bb_front_squat|Agachamento frontal|Front squat|quads|all|squat|c|barbell|3|knee,wrist|0
goblet_squat|Agachamento goblet|Goblet squat|quads|all|squat|c|dumbbell|1|knee|0
smith_squat|Agachamento no Smith|Smith machine squat|quads|all|squat|c|smith|1|knee|0
hack_squat|Agachamento hack|Hack squat|quads|all|squat|c|machine|1|knee|0
leg_press|Leg press 45|Leg press|quads|all|squat|c|machine|1|knee|0
bodyweight_squat|Agachamento livre|Bodyweight squat|quads|all|squat|c|bodyweight|1|knee|0
kb_goblet_squat|Agachamento goblet com kettlebell|Kettlebell goblet squat|quads|all|squat|c|kettlebell|1|knee|0
bulgarian_split_squat|Agachamento búlgaro|Bulgarian split squat|quads|all|lunge|c|dumbbell|2|knee|1
walking_lunge|Avanço caminhando|Walking lunge|quads|all|lunge|c|dumbbell|1|knee|1
reverse_lunge|Avanço reverso|Reverse lunge|quads|all|lunge|c|bodyweight|1|knee|1
bb_lunge|Avanço com barra|Barbell lunge|quads|all|lunge|c|barbell|2|knee|1
step_up|Subida no banco|Step-up|quads|all|lunge|c|dumbbell|1|knee|1
smith_lunge|Avanço no Smith|Smith split squat|quads|all|lunge|c|smith|1|knee|1
leg_extension|Cadeira extensora|Leg extension|quads|all|knee_extension|i|machine|1|knee|0
sissy_squat|Sissy squat|Sissy squat|quads|all|knee_extension|i|bodyweight|3|knee|0
band_leg_extension|Extensão de joelho com elástico|Band leg extension|quads|all|knee_extension|i|band|1|knee|0
bb_rdl|Levantamento terra romeno|Romanian deadlift|hamstrings|all|hinge|c|barbell|2|lower_back|0
db_rdl|Stiff com halteres|Dumbbell Romanian deadlift|hamstrings|all|hinge|c|dumbbell|1|lower_back|0
bb_deadlift|Levantamento terra|Conventional deadlift|hamstrings|all|hinge|c|barbell|3|lower_back|0
kb_swing|Swing com kettlebell|Kettlebell swing|hamstrings|all|hinge|c|kettlebell|2|lower_back|0
good_morning|Good morning|Good morning|hamstrings|all|hinge|c|barbell|2|lower_back|0
single_leg_rdl|Stiff unilateral|Single-leg Romanian deadlift|hamstrings|all|hinge|c|dumbbell|2||1
cable_pull_through|Pull-through na polia|Cable pull-through|hamstrings|all|hinge|c|cable|1||0
lying_leg_curl|Mesa flexora|Lying leg curl|hamstrings|all|knee_flexion|i|machine|1||0
seated_leg_curl|Cadeira flexora|Seated leg curl|hamstrings|all|knee_flexion|i|machine|1||0
nordic_curl|Flexão nórdica|Nordic hamstring curl|hamstrings|all|knee_flexion|i|bodyweight|3|knee|0
band_leg_curl|Flexão de joelho com elástico|Band leg curl|hamstrings|all|knee_flexion|i|band|1||0
swiss_ball_curl|Flexão de joelho na bola suíça|Stability ball leg curl|hamstrings|all|knee_flexion|i|bodyweight|2||0
bb_hip_thrust|Elevação pélvica com barra|Barbell hip thrust|glutes|max|hip_thrust|c|barbell|1||0
machine_hip_thrust|Elevação pélvica na máquina|Machine hip thrust|glutes|max|hip_thrust|c|machine|1||0
glute_bridge|Ponte de glúteo|Glute bridge|glutes|max|hip_thrust|c|bodyweight|1||0
smith_hip_thrust|Elevação pélvica no Smith|Smith hip thrust|glutes|max|hip_thrust|c|smith|1||0
single_leg_hip_thrust|Elevação pélvica unilateral|Single-leg hip thrust|glutes|max|hip_thrust|c|bodyweight|2||1
cable_kickback|Coice de glúteo na polia|Cable glute kickback|glutes|max|hip_extension|i|cable|1||1
glute_kickback_machine|Coice de glúteo na máquina|Machine glute kickback|glutes|max|hip_extension|i|machine|1||1
hip_abduction_machine|Cadeira abdutora|Hip abduction machine|glutes|medius|hip_abduction|i|machine|1||0
cable_abduction|Abdução de quadril na polia|Cable hip abduction|glutes|medius|hip_abduction|i|cable|1||1
band_abduction|Abdução com mini band|Banded hip abduction|glutes|medius|hip_abduction|i|band|1||0
side_lying_abduction|Abdução deitado de lado|Side-lying hip abduction|glutes|medius|hip_abduction|i|bodyweight|1||1
standing_calf_raise|Panturrilha em pé na máquina|Standing calf raise|calves|gastrocnemius|calf_raise|i|machine|1||0
smith_calf_raise|Panturrilha em pé no Smith|Smith calf raise|calves|gastrocnemius|calf_raise|i|smith|1||0
leg_press_calf|Panturrilha no leg press|Leg press calf raise|calves|gastrocnemius|calf_raise|i|machine|1||0
db_calf_raise|Panturrilha unilateral com halter|Single-leg dumbbell calf raise|calves|gastrocnemius|calf_raise|i|dumbbell|1||1
bw_calf_raise|Panturrilha no degrau|Bodyweight calf raise|calves|gastrocnemius|calf_raise|i|bodyweight|1||0
seated_calf_raise|Panturrilha sentado|Seated calf raise|calves|soleus|seated_calf_raise|i|machine|1||0
db_seated_calf|Panturrilha sentado com halter|Seated dumbbell calf raise|calves|soleus|seated_calf_raise|i|dumbbell|1||0
crunch|Abdominal supra|Crunch|core|abs|core_flexion|i|bodyweight|1||0
cable_crunch|Abdominal na polia|Cable crunch|core|abs|core_flexion|i|cable|1||0
machine_crunch|Abdominal na máquina|Machine crunch|core|abs|core_flexion|i|machine|1||0
sit_up|Abdominal completo|Sit-up|core|abs|core_flexion|i|bodyweight|1|lower_back|0
hanging_leg_raise|Elevação de pernas na barra|Hanging leg raise|core|lower_abs|leg_raise|i|pullup_bar|2|shoulder|0
lying_leg_raise|Elevação de pernas deitado|Lying leg raise|core|lower_abs|leg_raise|i|bodyweight|1|lower_back|0
captains_chair|Elevação de pernas no apoio|Captain's chair leg raise|core|lower_abs|leg_raise|i|machine|1||0
reverse_crunch|Abdominal reverso|Reverse crunch|core|lower_abs|leg_raise|i|bodyweight|1||0
plank|Prancha|Plank|core|abs|anti_extension|i|bodyweight|1||0
ab_wheel|Roda abdominal|Ab wheel rollout|core|abs|anti_extension|i|bodyweight|3|lower_back,shoulder|0
dead_bug|Dead bug|Dead bug|core|abs|anti_extension|i|bodyweight|1||0
side_plank|Prancha lateral|Side plank|core|obliques|anti_lateral|i|bodyweight|1|shoulder|0
pallof_press|Pallof press|Pallof press|core|obliques|anti_rotation|i|cable|1||0
russian_twist|Giro russo|Russian twist|core|obliques|rotation|i|bodyweight|1|lower_back|0
cable_woodchop|Lenhador na polia|Cable woodchop|core|obliques|rotation|i|cable|1||0
burpee|Burpee|Burpee|fullbody|conditioning|conditioning|c|bodyweight|2|wrist,knee|0
kb_clean_press|Clean and press com kettlebell|Kettlebell clean and press|fullbody|power|power|c|kettlebell|3|shoulder,lower_back|1
db_thruster|Thruster com halteres|Dumbbell thruster|fullbody|power|power|c|dumbbell|2|knee,shoulder|0
mountain_climber|Escalador|Mountain climber|fullbody|conditioning|conditioning|c|bodyweight|1|wrist|0
jump_squat|Agachamento com salto|Jump squat|quads|all|plyometric|c|bodyweight|2|knee|0
box_jump|Salto na caixa|Box jump|quads|all|plyometric|c|bodyweight|2|knee|0
jumping_jack|Polichinelo|Jumping jack|fullbody|conditioning|conditioning|c|bodyweight|1|knee|0
rowing_machine|Remo ergômetro|Rowing machine|fullbody|conditioning|cardio|c|machine|1|lower_back|0
assault_bike|Bike de ar (assault bike)|Air bike|fullbody|conditioning|cardio|c|machine|1||0
treadmill_run|Corrida na esteira|Treadmill run|fullbody|conditioning|cardio|c|machine|1|knee|0
jump_rope|Pular corda|Jump rope|fullbody|conditioning|cardio|c|bodyweight|1|knee|0
battle_ropes|Battle ropes|Battle ropes|fullbody|conditioning|conditioning|c|bodyweight|2|shoulder|0
sled_push|Empurrar trenó|Sled push|fullbody|conditioning|conditioning|c|machine|2||0
"""
out=[]; seen=set()
for line in R.strip().splitlines():
    p=line.split('|')
    assert len(p)==11, line
    i,pt,en,mu,rg,pa,ty,eq,lv,co,un=p
    assert i not in seen, i; seen.add(i)
    out.append({"id":i,"name":{"pt":pt,"en":en},"muscle":mu,"region":rg,"pattern":pa,
      "type":"compound" if ty=='c' else "isolation","equipment":eq,"level":int(lv),
      "contra":[c for c in co.split(',') if c],"unilateral":un=='1'})
    out[-1]["primary"], out[-1]["secondary"] = muscles_for(out[-1])
json.dump({"version":1,"exercises":out},open(sys.argv[1],'w'),ensure_ascii=False,separators=(',',':'))
# relatório de grupos de equivalência
from collections import Counter
g=Counter((e['muscle'],e['region'],e['pattern'],e['type']) for e in out)
print(len(out),"exercícios;",len(g),"grupos; grupos com 1 só:",[k for k,v in g.items() if v==1])
