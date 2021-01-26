
// [COMBO] {"material":"ui_editor_properties_shading","combo":"SHADING","type":"options","default":7}
// [COMBO] {"material":"ui_editor_properties_blend_mode","combo":"BLENDMODE","type":"imageblending","default":0}
// [COMBO] {"material":"ui_editor_properties_write_alpha","combo":"WRITEALPHA","type":"options","default":0}

#include "common.h"
#include "common_blending.h"

varying vec4 v_TexCoord;

uniform sampler2D g_Texture0; // {"material":"framebuffer","label":"ui_editor_properties_framebuffer","hidden":true}
uniform sampler2D g_Texture1; // {"default":"util/clouds_256","label":"ui_editor_properties_albedo","material":"albedo"}


uniform sampler2D g_Texture2; // {"combo":"MASK","default":"util/white","label":"ui_editor_properties_opacity_mask","material":"mask","mode":"opacitymask","paintdefaultcolor":"0 0 0 1"}



uniform float g_CloudsAlpha; // {"material":"alpha","label":"ui_editor_properties_alpha","default":1.0,"range":[0.01, 1]}
uniform float g_CloudThreshold; // {"material":"threshold","label":"ui_editor_properties_threshold","default":0,"range:":[0,1]}
uniform float g_CloudFeather; // {"material":"feather","label":"ui_editor_properties_feather","default":0.5,"range":[0,1]}
uniform float g_CloudLOD; // {"material":"smoothness","label":"ui_editor_properties_smoothness","default":0.0,"range":[0, 5]}

uniform vec3 g_Color1; // {"default":"1 1 1","label":"ui_editor_properties_color_start","material":"colorstart","type":"color"}


uniform vec3 g_Color2; // {"default":"1 1 1","label":"ui_editor_properties_color_end","material":"colorend","type":"color"}



#if SHADING == 100
uniform float g_CloudShading; // {"material":"shadingamount","label":"ui_editor_properties_shading_amount","default":50,"range":[0,100]}
uniform float g_ShadingDirection; // {"material":"shadingdirection","label":"ui_editor_properties_shading_direction","default":3.141,"range":[0,6.28]}
#endif


#if PERSPECTIVE == 0
varying vec4 v_TexCoordClouds;
#else
uniform float g_Time;
uniform vec4 g_CloudSpeeds; // {"default":"0.01 0.01 -0.02 -0.02","label":"ui_editor_properties_speed","material":"speed"}


uniform vec4 g_CloudScales; // {"default":"1.3 1.3 0.5 0.5","label":"ui_editor_properties_scale","material":"scale"}



varying vec3 v_TexCoordPerspective;
#endif





void main() {
	vec4 albedo = texSample2D(g_Texture0, v_TexCoord.xy);
	vec4 cloudTexCoods;
	
#if PERSPECTIVE == 0
	cloudTexCoods = v_TexCoordClouds;
#else
	//vec2 paddedCoords = v_TexCoord.xy;
	//paddedCoords.x = mix(paddedCoords.x + g_PerspectivePaddingVars.y, paddedCoords.x - g_PerspectivePaddingVars.w, paddedCoords.x);
	//paddedCoords.y = mix(paddedCoords.y + g_PerspectivePaddingVars.x, paddedCoords.y - g_PerspectivePaddingVars.z, paddedCoords.y);
	//cloudTexCoods.xy = performPerspectiveTransformation(paddedCoords.xy);
	//cloudTexCoods.zw = performPerspectiveTransformation(paddedCoords.xy);

	//float aspect = g_Texture0Resolution.z / g_Texture0Resolution.w;
	
	vec2 perspectiveCoords = v_TexCoordPerspective.xy / v_TexCoordPerspective.z;
	cloudTexCoods.xyzw = perspectiveCoords.xyxy;
	
	cloudTexCoods.xy = (cloudTexCoods.xy + g_Time * g_CloudSpeeds.xy) * g_CloudScales.xy;
	cloudTexCoods.zw = (cloudTexCoods.zw + g_Time * g_CloudSpeeds.zw) * g_CloudScales.zw;
	//cloudTexCoods.xz *= aspect;
	cloudTexCoods.zw = vec2(-cloudTexCoods.w, cloudTexCoods.z);
	
	//cloudTexCoods.xy = corPix(0, 0,
	//						1, 0,
	//						1, 1,
	//						0, 1,
	//						v_TexCoord.x, v_TexCoord.y);
	//cloudTexCoods.zw = corPix(0, 0,
	//						1, 0,
	//						1, 1,
	//						0, 1,
	//						v_TexCoord.x, v_TexCoord.y);
	
#endif
	
	
	
	
	//float cloud0 = texSample2D(g_Texture1, v_TexCoordClouds.xy).r;
	//float cloud1 = texSample2D(g_Texture1, v_TexCoordClouds.zw).r;
	float cloud0 = texSample2DLod(g_Texture1, cloudTexCoods.xy, g_CloudLOD).r;
	float cloud1 = texSample2DLod(g_Texture1, cloudTexCoods.zw, g_CloudLOD).r;
	
	float cloudBlend = cloud0 * cloud1;
	vec3 cloudColor = CAST3(1.0);
	
#if SHADING == 1
	//float light = 0.5;
	//vec2 cloudDeltas = vec2(ddx(cloudBlend), ddy(cloudBlend));
	//float shadingLength = length(cloudDeltas);
	//if (shadingLength > 0.001)
	//{
	//	cloudDeltas *= g_CloudShading;
	//	vec2 direction = rotateVec2(vec2(0, -1.0), g_ShadingDirection);
	//	light = saturate(dot(direction, cloudDeltas) * 0.5 + 0.5);
	//}
	//cloudColor = mix(g_Color2, g_Color1, light);
#endif

	cloudBlend = smoothstep(g_CloudThreshold, g_CloudThreshold + g_CloudFeather, cloudBlend);
	
	float blend = cloudBlend * g_CloudsAlpha;
	
#if SHADING == 0
	cloudColor = mix(g_Color2, g_Color1, blend);
#else
	cloudColor = mix(g_Color2, g_Color1, blend) * cloud0 * cloud1;
#endif

#if MASK == 1
	blend *= texSample2D(g_Texture2, v_TexCoord.zw).r;
#endif
	
	albedo.rgb = ApplyBlending(BLENDMODE, albedo.rgb, cloudColor, blend);
	
#if WRITEALPHA == 1
	//albedo.a = 1.0;
	albedo.a = blend;
#endif
	
	gl_FragColor = albedo;
}
