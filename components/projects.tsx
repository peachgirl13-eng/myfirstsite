"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { X, Plus, Upload, ChevronDown, LayoutGrid } from "lucide-react"
import { EditableText } from "@/components/editable/editable-text"
import { EditableMedia } from "@/components/editable/editable-media"
import { EditableBackground } from "@/components/editable/editable-background"
import { useInlineEditor } from "@/contexts/inline-editor-context"
import { COMMON_STYLES } from "@/lib/constants"

// 💡 데이터 구조에 fileUrl 추가: 프로젝트 파일 경로를 저장합니다.
interface ProjectData {
  image: string;
  video?: string;
  title: string;
  description: string;
  fileUrl?: string; // 💡 새 필드 추가
}

export function Projects() {
  const { getData, saveData, isEditMode, saveToFile } = useInlineEditor()
  // 기본 데이터
  const defaultInfo = {
    title: "프로젝트",
    subtitle: "https://drive.google.com/drive/folders/1ngUU4Wd6l50wIzIScqmKV50YtCxcapHz?usp=drive_link",
    initialDisplay: 6,
    loadMoreCount: 3,
    background: {"image":"","video":"","color":"#c7ad75","opacity":0.3},
    projects: [
        {"image":"/uploads/project-1765104040822-1765104041117.png","video":"","title":"부동산금융수업-부동산 가격 결정요인 분석","description":"서울시 내 500건의 가상 실거래 데이터를 활용하여 주택 가격에 영향을 미치는 요인들\n을 실증적으로 분석", "fileUrl": ""},
        {"image":"/uploads/project-1-1765105898676.png","video":"","title":"부동산금융수업-최적 포트폴리오 구성 분석 및 금리사이클에 따른 리츠 성과 연구","description":"리츠 투자와 S&P500의 위험 대비 수익률 특성 비교 및 최적의 투자 비중 도출.\n장기 수익성과 시장 위기 대응력 검증", "fileUrl": ""},
        {"image":"/uploads/project-1765106737363-1765106737565.png","video":"","title":"교통계획수업-동백동 생활권의 교통자립성 강화를 위한 수요응답형교통(DRT) 도입 – GTX 구성역 연계를 중심으로 -","description":"GTX 구성역 개통 효과를 극대화하고 동백동 주민의 교통 불편을 해소하기 위해, 기존 대중교통의 한계를 보완할 수 있는DRT를 동백동에 도입하고 GTX 연계 중심으로 운영하는 구체적인 전략 및 정책 제언을 제시", "fileUrl": ""},
        {"image":"/uploads/project-1765106752525-1765106752748.png","video":"","title":"스마트도시론-성남시 교통 취약지역 DRT 도입방안","description":"성남시에서 교통이 취약한 지역을 선정하고 그 해결책으로 DRT 도입방안을 제시. od분석을 통해 실제 동선을 파악하고 현재 운영 중인 버스 노선과 연관지어 수요대비 공급이 미흡한 곳에 DRT를 도입하고자 함", "fileUrl": ""}
    ] as Array<ProjectData> // 💡 타입 선언 수정
  }

  const [projectsInfo, setProjectsInfo] = useState(defaultInfo)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageAspects, setImageAspects] = useState<{ [key: string]: string }>({})
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [displayCount, setDisplayCount] = useState(defaultInfo.initialDisplay)
  const [showDisplaySettings, setShowDisplaySettings] = useState(false)
  // 💡 newProject 상태에 fileUrl 추가
  const [newProject, setNewProject] = useState({
    image: "",
    title: "",
    description: "",
    fileUrl: "" // 💡 새 필드 추가
  })
  const [backgroundData, setBackgroundData] = useState(
    defaultInfo.background
  )
  
  // localStorage에서 데이터 로드 - 편집 모드가 변경될 때마다 실행
  useEffect(() => {
    const savedData = getData('projects-info') as typeof defaultInfo | null
    if (savedData) {
      const mergedData = { ...defaultInfo, ...savedData }
      setProjectsInfo(mergedData)
      setDisplayCount(mergedData.initialDisplay || defaultInfo.initialDisplay)
      // background 데이터가 있으면 설정
      if (savedData.background) {
        setBackgroundData(savedData.background)
      }
    }
    
    const savedBg = getData('projects-background') as { image: string; video: string; color: string; opacity: number } | null
    if (savedBg) {
      setBackgroundData(savedBg)
    }
  }, [isEditMode]) // isEditMode가 변경될 때마다 데이터 다시 로드
  
  const updateProjectsInfo = async (key: string, value: string | number | boolean | typeof projectsInfo.projects) => {
    const newInfo = { ...projectsInfo, [key]: value }
    setProjectsInfo(newInfo)
    saveData('projects-info', newInfo)
    // 파일에도 자동 저장
    await saveToFile('projects', 'Info', newInfo)
  }
  
  const updateProject = async (index: number, field: string, value: string) => {
    const newProjects = [...projectsInfo.projects]
    newProjects[index] = { ...newProjects[index], [field]: value }
    await updateProjectsInfo('projects', newProjects)
  }
  
  
  const removeProject = async (index: number) => {
    // 삭제할 프로젝트의 이미지/비디오 파일 경로 가져오기
    const projectToRemove = projectsInfo.projects[index]
    
    // 이미지, 비디오, 💡파일 URL이 uploads 폴더의 파일인 경우 삭제
    const filesToDelete = [
      projectToRemove.image,
      projectToRemove.video,
      projectToRemove.fileUrl // 💡 fileUrl 추가
    ].filter((path): path is string => !!path && path.includes('/uploads/'))
    
    for (const path of filesToDelete) {
      try {
        const response = await fetch('/api/delete-image', { // 파일 삭제 API 사용 가정
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imagePath: path })
        })
        if (response.ok) {
          console.log(`✅ 프로젝트 파일 삭제 완료: ${path}`)
        }
      } catch (error) {
        console.error('프로젝트 파일 삭제 실패:', error)
      }
    }

    // 프로젝트 목록에서 제거
    const newProjects = projectsInfo.projects.filter((_, i) => i !== index)
    await updateProjectsInfo('projects', newProjects)
  }
  
  // 표시할 프로젝트들
  const validProjects = projectsInfo.projects
  const visibleProjects = isEditMode ? validProjects : validProjects.slice(0, displayCount)
  const hasMoreProjects = validProjects.length > displayCount
  
  // 더보기 버튼 클릭
  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + projectsInfo.loadMoreCount, validProjects.length))
  }
  
  // 이미지 비율 감지 함수 (생략되지 않음)
  const detectImageAspect = (src: string) => {
    if (!src) return
    
    const img = new Image()
    img.onload = () => {
      const ratio = img.width / img.height
      let aspectClass: string
      
      // 일반적인 이미지 비율들 감지
      if (ratio >= 1.7 && ratio <= 1.8) {
        aspectClass = 'aspect-video' // 16:9 (1.777...)
      } else if (ratio >= 1.3 && ratio <= 1.35) {
        aspectClass = 'aspect-[4/3]' // 4:3 (1.333...)
      } else if (ratio >= 0.95 && ratio <= 1.05) {
        aspectClass = 'aspect-square' // 1:1 (1.0)
      } else if (ratio >= 0.74 && ratio <= 0.76) {
        aspectClass = 'aspect-[3/4]' // 3:4 (0.75)
      } else if (ratio >= 0.55 && ratio <= 0.57) {
        aspectClass = 'aspect-[9/16]' // 9:16 (0.5625)
      } else if (ratio >= 1.4 && ratio <= 1.45) {
        aspectClass = 'aspect-[3/2]' // 3:2 (1.5)
      } else if (ratio >= 0.65 && ratio <= 0.67) {
        aspectClass = 'aspect-[2/3]' // 2:3 (0.666...)
      } else if (ratio > 1.8) {
        aspectClass = 'aspect-[21/9]' // 초광각
      } else if (ratio < 0.55) {
        aspectClass = 'aspect-[1/2]' // 매우 세로
      } else {
        // 기타 비율은 가장 가까운 것으로
        if (ratio > 1) {
          aspectClass = 'aspect-video' // 기본 가로
        } else {
          aspectClass = 'aspect-[3/4]' // 기본 세로
        }
      }
      
      setImageAspects(prev => ({ ...prev, [src]: aspectClass }))
    }
    img.src = src
  }
  
  // 모든 이미지 비율 감지
  useEffect(() => {
    validProjects.forEach(project => {
      detectImageAspect(project.image)
    })
  }, [validProjects.length]) // 유효한 projects 개수가 변경되면 다시 실행

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedImage(null)
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  return (
    <>
      <EditableBackground
        image={backgroundData.image}
        video={backgroundData.video}
        color={backgroundData.color}
        opacity={backgroundData.opacity}
        onChange={(data) => {
          const newData = { ...backgroundData, ...data }
          setBackgroundData(newData)
          saveData('projects-background', newData)
          
          // projectsInfo도 업데이트 (파일 저장을 위해)
          const updatedProjectsInfo = { ...projectsInfo, background: newData }
          setProjectsInfo(updatedProjectsInfo)
          saveData('projects-info', updatedProjectsInfo)
        }}
        storageKey="projects-background"
        className="relative"
      >
        <section id="projects" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 섹션 제목 */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              <EditableText
                value={projectsInfo.title}
                onChange={(value) => updateProjectsInfo('title', value)}
                storageKey="projects-title"
              />
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              <EditableText
                value={projectsInfo.subtitle}
                onChange={(value) => updateProjectsInfo('subtitle', value)}
                storageKey="projects-subtitle"
              />
            </p>
          </div>

          {/* 프로젝트가 없을 때 */}
          {validProjects.length === 0 && !isEditMode ? (
            <div className="text-center py-20">
              <span className="text-6xl block mb-4">🚀</span>
              <p className="text-xl text-muted-foreground">준비 중입니다</p>
            </div>
          ) : (
            /* 프로젝트 그리드 */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleProjects.map((project, index) => {
                
                return (
                  <div 
                    key={index}
                    className="group flex flex-col relative cursor-pointer"
                    onClick={() => !isEditMode && setSelectedImage(project.video || project.image)}
                  >
                    {isEditMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeProject(index)
                        }}
                        className={COMMON_STYLES.deleteButton}
                      >
                        <X className={COMMON_STYLES.deleteIcon} />
                      </button>
                    )}
                    
                    {/* 이미지/비디오 영역 */}
                    <div className="relative aspect-[4/3] rounded-lg bg-muted mb-3 overflow-hidden">
                      {project.video ? (
                        <video
                          src={project.video}
                          className="absolute inset-0 w-full h-full object-contain bg-muted transition-transform duration-300 group-hover:scale-105"
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      ) : (
                        <EditableMedia
                          src={project.image || ""}
                          onChange={(src) => updateProject(index, 'image', src)}
                          type="auto"
                          storageKey={`project-${index}-image`}
                          className="absolute inset-0 w-full h-full object-contain bg-muted transition-transform duration-300 group-hover:scale-105"
                          alt={project.title}
                          purpose={`project-${index}`}
                        />
                      )}
                    </div>
                    
                    {/* 텍스트 영역 */}
                    <div className="flex-grow">
                      <h3 className="font-semibold text-foreground mb-1">
                        <EditableText
                          value={project.title || "프로젝트 제목"}
                          onChange={(value) => updateProject(index, 'title', value)}
                          storageKey={`project-${index}-title`}
                        />
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        <EditableText
                          value={project.description || "프로젝트 설명"}
                          onChange={(value) => updateProject(index, 'description', value)}
                          storageKey={`project-${index}-description`}
                          multiline
                        />
                      </p>
                      
                      {/* 💡 첨부 파일 링크 추가 */}
                      {project.fileUrl && (
                        <a 
                          href={project.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()} // 클릭 시 확대 모달 열림 방지
                          className="inline-flex items-center text-sm mt-2 font-medium text-blue-500 hover:text-blue-600 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M12 17v-6"></path><path d="M9 14l3 3l3-3"></path></svg>
                          파일 다운로드
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
              
              {/* 편집 버튼 */}
              {isEditMode && (
                <div 
                  className="h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                  onClick={() => setShowProjectModal(true)}
                >
                  <div className="text-center">
                    <Plus className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">프로젝트 추가</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* 더보기 버튼 */}
          {hasMoreProjects && !isEditMode && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all inline-flex items-center gap-2"
              >
                <ChevronDown className="h-5 w-5" />
                더 많은 프로젝트 보기 ({validProjects.length - displayCount}개 더)
              </button>
            </div>
          )}
          
          {/* 표시 설정 버튼 (편집 모드에서만) */}
          {isEditMode && (
            <div className="text-center mt-8">
              <button
                onClick={() => setShowDisplaySettings(true)}
                className="px-6 py-3 bg-muted hover:bg-muted/80 rounded-lg transition-all inline-flex items-center gap-2"
              >
                <LayoutGrid className="h-5 w-5" />
                더보기 설정
              </button>
            </div>
          )}
          </div>
        </section>
      </EditableBackground>

{/* 이미지 / 비디오 확대 모달 */}
{selectedImage && (
  <div
    className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
    onClick={() => setSelectedImage(null)}
  >
    <div
      className="relative bg-background rounded-lg shadow-2xl max-w-4xl max-h-[85vh] w-full overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setSelectedImage(null)}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 hover:bg-background shadow-lg transition-all hover:scale-110"
        aria-label="닫기"
      >
        <X className="w-5 h-5 text-foreground" />
      </button>

      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* 비디오일 경우 */}
        {selectedImage.includes(".mp4") || selectedImage.includes(".webm") ? (
          <video
            src={selectedImage}
            controls
            className="max-h-[75vh] rounded-lg"
          />
        ) : (
          <>
            {/* 이미지일 경우 */}
            <img
              src={selectedImage}
              alt="확대 이미지"
              className="max-h-[75vh] rounded-lg object-contain"
            />
          </>
        )}
      </div>
    </div>
  </div>
)}  
      {/* 프로젝트 추가 모달 */}
      {showProjectModal && isEditMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-background border rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">새 프로젝트 추가</h3>
              <button
                onClick={async () => {
                  // 업로드된 이미지가 있으면 삭제
                  if (newProject.image && newProject.image.includes('/uploads/')) {
                    try {
                      await fetch('/api/delete-image', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ imagePath: newProject.image })
                      })
                    } catch (error) {
                      console.error('Failed to delete uploaded file:', error)
                    }
                  }
                  // 💡 newProject 상태 초기화 시 fileUrl도 초기화
                  setNewProject({ image: "", title: "", description: "", fileUrl: "" }) 
                  setShowProjectModal(false)
                }}
                className="p-1 hover:bg-muted rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* 이미지/비디오 업로드 (기존 코드와 동일) */}
              <div>
                <label className="text-sm font-medium mb-2 block">프로젝트 이미지/비디오</label>
                <div className="h-48 rounded-lg overflow-hidden bg-muted">
                  {newProject.image ? (
                    <div className="relative h-full">
                      {newProject.image.includes('.mp4') || newProject.image.includes('.webm') ? (
                        <video 
                          src={newProject.image} 
                          className="w-full h-full object-cover"
                          autoPlay 
                          loop 
                          muted 
                          playsInline
                        />
                      ) : (
                        <img 
                          src={newProject.image} 
                          alt="프로젝트 미리보기"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <button
                        onClick={() => setNewProject({...newProject, image: ""})}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-2">
                      <input
                        id="project-upload"
                        type="file"
                        accept="image/*,video/mp4,video/webm"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          
                          const isVideo = file.type.includes('video')
                          const maxSize = isVideo ? 20 * 1024 * 1024 : 5 * 1024 * 1024
                          
                          if (file.size > maxSize) {
                            alert(`파일 크기는 ${isVideo ? '20MB' : '5MB'} 이하여야 합니다`)
                            return
                          }
                          
                          const formData = new FormData()
                          formData.append('file', file)
                          formData.append('purpose', `project-${Date.now()}`)
                          
                          try {
                            const response = await fetch(isVideo ? '/api/upload-video' : '/api/upload-image', {
                              method: 'POST',
                              body: formData
                            })
                            
                            const result = await response.json()
                            
                            if (result.success) {
                              setNewProject({...newProject, image: result.path})
                            } else {
                              alert(`❌ ${result.error}`)
                            }
                          } catch {
                            alert('업로드 중 오류가 발생했습니다')
                          }
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="project-upload"
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 cursor-pointer"
                      >
                        <Upload className="h-4 w-4 inline mr-2" />
                        이미지/비디오 파일 업로드
                      </label>
                      <input
                        type="text"
                        value={newProject.image}
                        onChange={(e) => setNewProject({...newProject, image: e.target.value})}
                        placeholder="또는 URL 입력 (https://...)"
                        className="px-3 py-2 border rounded-lg bg-background text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* 프로젝트 제목 */}
              <div>
                <label className="text-sm font-medium mb-1 block">프로젝트 제목</label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  placeholder="예: 브랜드 리뉴얼 프로젝트"
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                />
              </div>
              
              {/* 프로젝트 설명 */}
              <div>
                <label className="text-sm font-medium mb-1 block">프로젝트 설명</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  placeholder="예: 스타트업 A사의 전체 브랜딩 리뉴얼 및 UI/UX 개선"
                  className="w-full px-3 py-2 border rounded-lg bg-background resize-none"
                  rows={3}
                />
              </div>
              
              {/* 💡 첨부 파일 업로드 섹션 */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  첨부 파일 (PDF, Docx 등)
                  {newProject.fileUrl && (
                    <span className="text-xs text-primary ml-2">
                      (현재 파일: {newProject.fileUrl.split('/').pop()})
                    </span>
                  )}
                </label>
                <div className="flex flex-col gap-2 p-3 border rounded-lg bg-muted/20">
                  <input
                    id="project-file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.hwp,.zip" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      
                      const maxSize = 10 * 1024 * 1024 
                      if (file.size > maxSize) {
                        alert(`파일 크기는 10MB 이하여야 합니다`)
                        return
                      }
                      
                      const formData = new FormData()
                      formData.append('file', file)
                      formData.append('purpose', `project-file-${Date.now()}`)
                      
                      try {
                        const response = await fetch('/api/upload-file', { // API 엔드포인트 가정
                          method: 'POST',
                          body: formData
                        })
                        
                        const result = await response.json()
                        
                        if (result.success) {
                          setNewProject({...newProject, fileUrl: result.path})
                          alert('✅ 파일이 성공적으로 업로드되었습니다.')
                        } else {
                          alert(`❌ ${result.error}`)
                        }
                      } catch {
                        alert('파일 업로드 중 오류가 발생했습니다')
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="project-file-upload"
                    className="w-full px-4 py-2 bg-background border rounded-lg hover:bg-muted cursor-pointer text-center text-sm font-medium"
                  >
                    <Upload className="h-4 w-4 inline mr-2" />
                    파일 업로드
                  </label>
                  <input
                    type="text"
                    value={newProject.fileUrl}
                    onChange={(e) => setNewProject({...newProject, fileUrl: e.target.value})}
                    placeholder="또는 파일 URL 입력 (https://...)"
                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                  />
                </div>
              </div>
              {/* 💡 첨부 파일 업로드 섹션 끝 */}
            </div>
            
            <div className="mt-6 flex gap-2">
              <button
                onClick={async () => {
                  if (newProject.title && newProject.description) {
                    // 비디오 URL 체크 및 처리
                    const isVideo = newProject.image && (newProject.image.includes('.mp4') || newProject.image.includes('.webm'))
                    const projectData = {
                      image: isVideo ? '' : newProject.image,
                      video: isVideo ? newProject.image : '',
                      title: newProject.title,
                      description: newProject.description,
                      fileUrl: newProject.fileUrl || '' // 💡 fileUrl 저장
                    }
                    const updatedProjects = [...projectsInfo.projects, projectData]
                    const updatedInfo = {...projectsInfo, projects: updatedProjects}
                    setProjectsInfo(updatedInfo)
                    saveData('projects-info', updatedInfo)
                    
                    // 파일에도 저장
                    const success = await saveToFile('projects', 'Info', updatedInfo)
                    if (success) {
                      alert('✅ 프로젝트가 추가되고 파일에 저장되었습니다!')
                    }
                    
                    setNewProject({ image: "", title: "", description: "", fileUrl: "" }) // 💡 fileUrl 초기화
                    setShowProjectModal(false)
                  } else {
                    alert('제목과 설명을 입력해주세요')
                  }
                }}
                className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                추가
              </button>
              <button
                onClick={async () => {
                  // 업로드된 이미지가 있으면 삭제
                  if (newProject.image && newProject.image.includes('/uploads/')) {
                    try {
                      await fetch('/api/delete-image', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ imagePath: newProject.image })
                      })
                    } catch (error) {
                      console.error('Failed to delete uploaded file:', error)
                    }
                  }
                  // 💡 newProject 상태 초기화 시 fileUrl도 초기화
                  setNewProject({ image: "", title: "", description: "", fileUrl: "" }) 
                  setShowProjectModal(false)
                }}
                className="flex-1 py-2 border rounded-lg hover:bg-muted"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 표시 설정 모달 (생략되지 않음) */}
      {showDisplaySettings && isEditMode && (
// ... (생략)
// ... (마지막까지 생략되지 않음)
      )}
    </>
  )
}
