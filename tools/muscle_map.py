# Músculos trabalhados por exercício: áreas principais (P) e secundárias (S).
# Padrão por (padrão de movimento, região) + ajustes por exercício. Usado por build_catalog.py.

TRI = ['triceps_lateral', 'triceps_medial']
BI = ['biceps_long', 'biceps_short']

def by_pattern(e):
    p, r, m = e['pattern'], e['region'], e['muscle']
    if p == 'horizontal_push':
        if r == 'upper': return ['pec_upper', 'delt_front'], TRI
        if r == 'lower': return ['pec_lower'], ['delt_front'] + TRI
        return ['pec_mid'], ['delt_front'] + TRI
    if p == 'fly':
        return [{'upper': 'pec_upper', 'lower': 'pec_lower'}.get(r, 'pec_mid')], ['delt_front']
    if p == 'pullover':
        if m == 'back': return ['lats', 'teres'], ['triceps_long', 'abs']
        return ['pec_mid', 'lats'], ['triceps_long', 'serratus']
    if p == 'vertical_pull': return ['lats', 'teres'], BI + ['brachialis', 'rhomboids', 'traps_mid']
    if p == 'horizontal_pull': return ['lats', 'traps_mid', 'rhomboids'], ['delt_rear', 'biceps_long', 'brachialis']
    if p == 'hinge' and m == 'back': return ['erectors'], ['glutes_max', 'hamstrings']
    if p == 'shrug': return ['traps_upper'], ['forearm_flexors', 'grip']
    if p == 'vertical_push': return ['delt_front', 'delt_side'], TRI + ['traps_upper', 'pec_upper']
    if p == 'front_raise': return ['delt_front'], ['pec_upper', 'delt_side']
    if p == 'lateral_raise': return ['delt_side'], ['traps_upper', 'delt_front']
    if p == 'rear_fly': return ['delt_rear'], ['traps_mid', 'rhomboids']
    if p == 'elbow_flexion': return BI, ['brachialis', 'brachioradialis']
    if p == 'elbow_flexion_stretch': return ['biceps_long'], ['biceps_short', 'brachialis']
    if p == 'elbow_flexion_short': return ['biceps_short'], ['biceps_long', 'brachialis']
    if p == 'hammer_curl': return ['brachialis', 'brachioradialis'], ['biceps_long']
    if p == 'elbow_extension_compound': return ['triceps_lateral', 'triceps_medial', 'triceps_long'], ['pec_mid', 'delt_front']
    if p == 'elbow_extension': return ['triceps_lateral', 'triceps_medial'], ['triceps_long']
    if p == 'elbow_extension_overhead': return ['triceps_long'], TRI
    if p == 'wrist_flexion': return ['forearm_flexors'], ['grip']
    if p == 'wrist_extension': return ['forearm_extensors'], []
    if p == 'reverse_curl': return ['brachioradialis', 'forearm_extensors'], ['brachialis', 'biceps_long']
    if p == 'carry': return ['grip', 'traps_upper', 'forearm_flexors'], ['obliques', 'transverse', 'glutes_med']
    if p == 'grip_hold': return ['grip', 'forearm_flexors'], ['lats', 'teres']
    if p == 'squat': return ['quads', 'glutes_max'], ['adductors', 'erectors', 'abs']
    if p == 'lunge': return ['quads', 'glutes_max'], ['adductors', 'glutes_med', 'hamstrings']
    if p == 'knee_extension': return ['quads'], []
    if p == 'hinge': return ['hamstrings', 'glutes_max'], ['erectors', 'adductors', 'grip']
    if p == 'knee_flexion': return ['hamstrings'], ['gastrocnemius']
    if p == 'hip_thrust': return ['glutes_max'], ['hamstrings', 'quads', 'glutes_med']
    if p == 'hip_extension': return ['glutes_max'], ['hamstrings', 'glutes_med']
    if p == 'hip_abduction': return ['glutes_med'], ['glutes_max']
    if p == 'calf_raise': return ['gastrocnemius'], ['soleus']
    if p == 'seated_calf_raise': return ['soleus'], ['gastrocnemius']
    if p == 'core_flexion': return ['abs'], ['obliques']
    if p == 'leg_raise': return ['lower_abs', 'hip_flexors'], ['abs', 'obliques']
    if p == 'anti_extension': return ['abs', 'transverse'], ['obliques', 'glutes_max']
    if p == 'anti_lateral': return ['obliques'], ['transverse', 'glutes_med']
    if p == 'anti_rotation': return ['obliques', 'transverse'], ['abs']
    if p == 'rotation': return ['obliques'], ['abs', 'transverse']
    if p == 'plyometric': return ['quads', 'glutes_max', 'gastrocnemius'], ['hamstrings', 'cardio']
    return [], []

OVERRIDES = {
    'push_up': (['pec_mid'], ['delt_front', 'triceps_lateral', 'triceps_medial', 'abs', 'serratus']),
    'decline_push_up': (['pec_upper', 'delt_front'], ['triceps_lateral', 'triceps_medial', 'abs', 'serratus']),
    'chest_dip': (['pec_lower', 'triceps_lateral', 'triceps_medial'], ['delt_front']),
    'chin_up': (['lats', 'biceps_short', 'biceps_long'], ['teres', 'brachialis', 'rhomboids', 'traps_mid']),
    'close_grip_pulldown': (['lats', 'teres'], ['biceps_long', 'biceps_short', 'brachialis', 'rhomboids', 'traps_mid']),
    'straight_arm_pulldown': (['lats', 'teres'], ['triceps_long', 'abs', 'pec_lower']),
    'bb_row': (['lats', 'traps_mid', 'rhomboids'], ['delt_rear', 'biceps_long', 'brachialis', 'erectors', 'hamstrings']),
    'pendlay_row': (['lats', 'traps_mid', 'rhomboids'], ['delt_rear', 'biceps_long', 'erectors', 'hamstrings']),
    't_bar_row': (['lats', 'traps_mid', 'rhomboids'], ['delt_rear', 'biceps_long', 'erectors']),
    'db_row': (['lats', 'traps_mid', 'rhomboids'], ['delt_rear', 'biceps_long', 'teres', 'obliques']),
    'inverted_row': (['lats', 'traps_mid', 'rhomboids'], ['delt_rear', 'biceps_long', 'abs']),
    'superman': (['erectors'], ['glutes_max', 'delt_rear']),
    'bb_ohp': (['delt_front', 'delt_side'], ['triceps_lateral', 'triceps_medial', 'traps_upper', 'pec_upper', 'abs']),
    'arnold_press': (['delt_front', 'delt_side'], ['triceps_lateral', 'triceps_medial', 'pec_upper']),
    'pike_push_up': (['delt_front'], ['triceps_lateral', 'triceps_medial', 'pec_upper', 'serratus']),
    'landmine_press': (['delt_front', 'pec_upper'], ['triceps_lateral', 'triceps_medial', 'serratus', 'obliques']),
    'upright_row': (['delt_side', 'traps_upper'], ['delt_front', 'biceps_long', 'brachialis']),
    'face_pull': (['delt_rear', 'rotator_cuff'], ['traps_mid', 'rhomboids']),
    'band_pull_apart': (['delt_rear', 'rhomboids'], ['traps_mid', 'rotator_cuff']),
    'close_grip_bench': (['triceps_lateral', 'triceps_medial', 'triceps_long', 'pec_mid'], ['delt_front']),
    'bench_dip': (['triceps_lateral', 'triceps_medial', 'triceps_long'], ['delt_front', 'pec_lower']),
    'triceps_dip': (['triceps_lateral', 'triceps_medial', 'triceps_long'], ['pec_lower', 'delt_front']),
    'machine_dip': (['triceps_lateral', 'triceps_medial', 'triceps_long'], ['pec_lower', 'delt_front']),
    'diamond_push_up': (['triceps_lateral', 'triceps_medial', 'triceps_long'], ['pec_mid', 'delt_front', 'abs']),
    'db_kickback': (['triceps_lateral', 'triceps_long'], ['triceps_medial', 'delt_rear']),
    'bb_back_squat': (['quads', 'glutes_max'], ['adductors', 'erectors', 'hamstrings', 'abs']),
    'bb_front_squat': (['quads'], ['glutes_max', 'erectors', 'traps_mid', 'abs']),
    'goblet_squat': (['quads', 'glutes_max'], ['adductors', 'abs', 'traps_upper']),
    'kb_goblet_squat': (['quads', 'glutes_max'], ['adductors', 'abs', 'traps_upper']),
    'leg_press': (['quads', 'glutes_max'], ['adductors', 'hamstrings']),
    'hack_squat': (['quads'], ['glutes_max', 'adductors']),
    'smith_squat': (['quads', 'glutes_max'], ['adductors', 'hamstrings']),
    'bodyweight_squat': (['quads', 'glutes_max'], ['adductors', 'abs']),
    'bulgarian_split_squat': (['quads', 'glutes_max'], ['adductors', 'glutes_med', 'hamstrings']),
    'step_up': (['quads', 'glutes_max'], ['glutes_med', 'hamstrings', 'gastrocnemius']),
    'sissy_squat': (['quads'], ['abs', 'hip_flexors']),
    'bb_deadlift': (['hamstrings', 'glutes_max', 'erectors'], ['quads', 'lats', 'traps_upper', 'grip', 'forearm_flexors']),
    'bb_rdl': (['hamstrings', 'glutes_max'], ['erectors', 'grip', 'adductors']),
    'db_rdl': (['hamstrings', 'glutes_max'], ['erectors', 'grip']),
    'single_leg_rdl': (['hamstrings', 'glutes_max'], ['glutes_med', 'erectors', 'obliques']),
    'good_morning': (['hamstrings', 'erectors'], ['glutes_max', 'adductors']),
    'kb_swing': (['glutes_max', 'hamstrings'], ['erectors', 'abs', 'delt_front', 'grip', 'cardio']),
    'cable_pull_through': (['glutes_max', 'hamstrings'], ['erectors']),
    'nordic_curl': (['hamstrings'], ['gastrocnemius', 'glutes_max']),
    'swiss_ball_curl': (['hamstrings'], ['glutes_max', 'gastrocnemius', 'abs']),
    'glute_bridge': (['glutes_max'], ['hamstrings', 'glutes_med']),
    'single_leg_hip_thrust': (['glutes_max'], ['hamstrings', 'glutes_med', 'quads']),
    'sit_up': (['abs'], ['hip_flexors', 'obliques']),
    'hanging_leg_raise': (['lower_abs', 'hip_flexors'], ['abs', 'obliques', 'grip', 'lats']),
    'ab_wheel': (['abs', 'transverse'], ['lats', 'delt_front', 'obliques']),
    'dead_bug': (['abs', 'transverse'], ['obliques', 'hip_flexors']),
    'cable_woodchop': (['obliques'], ['abs', 'delt_front', 'transverse']),
    'russian_twist': (['obliques'], ['abs', 'hip_flexors']),
    'burpee': (['quads', 'pec_mid', 'cardio'], ['delt_front', 'triceps_lateral', 'abs', 'glutes_max']),
    'mountain_climber': (['abs', 'hip_flexors', 'cardio'], ['delt_front', 'quads', 'transverse']),
    'jumping_jack': (['cardio', 'gastrocnemius'], ['delt_side', 'glutes_med', 'adductors']),
    'rowing_machine': (['lats', 'quads', 'cardio'], ['hamstrings', 'glutes_max', 'biceps_long', 'erectors', 'traps_mid']),
    'assault_bike': (['quads', 'cardio'], ['hamstrings', 'glutes_max', 'delt_front', 'triceps_lateral', 'lats']),
    'treadmill_run': (['quads', 'hamstrings', 'gastrocnemius', 'cardio'], ['glutes_max', 'hip_flexors', 'soleus']),
    'jump_rope': (['gastrocnemius', 'cardio'], ['soleus', 'quads', 'delt_front', 'forearm_flexors']),
    'battle_ropes': (['delt_front', 'cardio'], ['abs', 'obliques', 'biceps_long', 'grip', 'delt_side']),
    'sled_push': (['quads', 'glutes_max', 'cardio'], ['gastrocnemius', 'hamstrings', 'triceps_lateral', 'delt_front', 'abs']),
    'kb_clean_press': (['glutes_max', 'hamstrings', 'delt_front'], ['traps_upper', 'triceps_lateral', 'abs', 'grip']),
    'db_thruster': (['quads', 'glutes_max', 'delt_front'], ['triceps_lateral', 'delt_side', 'abs', 'cardio']),
    'box_jump': (['quads', 'glutes_max', 'gastrocnemius'], ['hamstrings', 'cardio']),
    'farmer_walk': (['grip', 'forearm_flexors', 'traps_upper'], ['obliques', 'transverse', 'glutes_med', 'quads']),
    'reverse_wrist_curl': (['forearm_extensors'], ['brachioradialis']),
    'leg_extension': (['quads'], ['hip_flexors']),
    'pullover_db': (['pec_mid', 'lats'], ['triceps_long', 'serratus', 'teres']),
}

AREAS = ['pec_upper', 'pec_mid', 'pec_lower', 'serratus', 'lats', 'teres', 'traps_upper', 'traps_mid', 'rhomboids', 'erectors',
         'delt_front', 'delt_side', 'delt_rear', 'rotator_cuff', 'biceps_long', 'biceps_short', 'brachialis', 'brachioradialis',
         'triceps_long', 'triceps_lateral', 'triceps_medial', 'forearm_flexors', 'forearm_extensors', 'grip',
         'quads', 'adductors', 'hamstrings', 'glutes_max', 'glutes_med', 'hip_flexors', 'gastrocnemius', 'soleus',
         'abs', 'lower_abs', 'obliques', 'transverse', 'cardio']

def muscles_for(e):
    prim, sec = OVERRIDES.get(e['id']) or by_pattern(e)
    sec = [s for s in sec if s not in prim]
    for a in prim + sec:
        assert a in AREAS, (e['id'], a)
    assert prim, e['id']
    return list(dict.fromkeys(prim)), list(dict.fromkeys(sec))
