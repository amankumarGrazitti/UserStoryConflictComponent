public class ConflictUserStoriesComponents {
    
    @AuraEnabled(cacheable=true)
    public static list<copado__Sprint__c> getSprintRecord(String sprintName){
        system.debug('sprintName__'+sprintName);
        list<copado__Sprint__c> sprintList = new list<copado__Sprint__c>();
        if (String.isBlank(sprintName)) {
            sprintList = [Select Id, Name FROM copado__Sprint__c LIMIT 5];
        }else{
            string searchKeyword = '%' + sprintName + '%';
            sprintList = [Select Id, Name FROM copado__Sprint__c WHERE name LIKE : searchKeyword LIMIT 5];
        }
        system.debug('sprintList__ '+ sprintList);
        return sprintList;
    }
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getComponentRecord(String sprintId, Integer pageNumber, Integer recordsPerPage){
        system.debug('sprintId__ '+sprintId);
        system.debug('pageNumber__ '+pageNumber);
        system.debug('recordsPerPage__ '+recordsPerPage);
        if(!String.isBlank(sprintId)){
            List<String> cmpNames = new List<String>();
            Map<String, Object> result = new Map<String, Object>();
            list<ComponentRecordsWrapper> componentRecordsWrapperList = new list<ComponentRecordsWrapper>();
            map<String,list<userStoryWrapper>> cmpNameUserStoryMap = new map<String,list<userStoryWrapper>>();
            Integer offsetValue = (pageNumber - 1) * recordsPerPage;
            
            for(copado__User_Story_Metadata__c uStory : [SELECT Id, copado__User_Story__c,copado__User_Story__r.copado__User_Story_Title__c,
                                                         copado__User_Story__r.name,copado__User_Story__r.copado__Developer__r.Name,copado__User_Story__r.Owner.Name,
                                                         copado__Metadata_API_Name__c FROM copado__User_Story_Metadata__c where copado__User_Story__r.copado__Sprint__c =: sprintId
                                                         ]){
                                                             userStoryWrapper storyWrapper = new userStoryWrapper();
                                                             storyWrapper.storyName = String.valueOf(uStory.copado__User_Story__r.name) + '-'+ uStory.copado__User_Story__r.copado__User_Story_Title__c;
                                                             storyWrapper.storyId = uStory.copado__User_Story__c;
                                                             storyWrapper.ownerName = uStory.copado__User_Story__r.Owner.Name;
                                                             storyWrapper.devName = uStory.copado__User_Story__r.copado__Developer__r.Name;
                                                             if(!cmpNameUserStoryMap.containskey(uStory.copado__Metadata_API_Name__c)){
                                                                 cmpNameUserStoryMap.put(uStory.copado__Metadata_API_Name__c, new list<userStoryWrapper>());
                                                             }
                                                             cmpNameUserStoryMap.get(uStory.copado__Metadata_API_Name__c).add(storyWrapper); 
                                                             
                                                         }
            
            Integer count = offsetValue + 1;
            for(copado__User_Story_Metadata__c uStory : [SELECT Id, copado__User_Story__c,copado__User_Story__r.copado__User_Story_Title__c,
                                                         copado__User_Story__r.name,copado__User_Story__r.copado__Developer__r.Name,copado__User_Story__r.Owner.Name,
                                                         copado__Metadata_API_Name__c FROM copado__User_Story_Metadata__c where copado__User_Story__r.copado__Sprint__c =: sprintId
                                                        ]){
                
                if (!cmpNames.contains(uStory.copado__Metadata_API_Name__c)) {
                    ComponentRecordsWrapper cmpWrapper = new ComponentRecordsWrapper();
                    cmpWrapper.serialNumber = count;
                    cmpWrapper.cmpName = uStory.copado__Metadata_API_Name__c;
                    cmpWrapper.userStory = cmpNameUserStoryMap.get(uStory.copado__Metadata_API_Name__c);
                    cmpNames.add(uStory.copado__Metadata_API_Name__c);
                    ComponentRecordsWrapperList.add(cmpWrapper);
                    count++;
                }
            }
            Integer totalRecords = [SELECT count() FROM copado__User_Story_Metadata__c where copado__User_Story__r.copado__Sprint__c =: sprintId];
            result.put('records', ComponentRecordsWrapperList);
            result.put('totalRecords', totalRecords);
            return result;
        }else{
            return null;
        }
    }
    
    // wrapper class of Component Records
    public with sharing class ComponentRecordsWrapper {
        @auraEnabled public String cmpName {get;set;}
        @auraEnabled public Id storyId {get;set;}
        @auraEnabled public List<string> storyNames {get;set;}
        @auraEnabled public Integer serialNumber {get;set;}
        @auraEnabled public List<userStoryWrapper> userStory {get;set;} 
    }
    public with sharing class userStoryWrapper {
        @auraEnabled public Id storyId {get;set;}
        @auraEnabled public string storyName {get;set;}
        @auraEnabled public string ownerName {get;set;}
        @auraEnabled public string devName {get;set;}
    }
}