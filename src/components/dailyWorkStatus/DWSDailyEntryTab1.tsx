// src/components/dailyWorkStatus/DWSDailyEntryTab.tsx
// src/components/dailyWorkStatus/DWSDailyEntryTab.tsx
// Restored last working version from src1/components/dailyWorkStatus/DWSDailyEntryTab.tsx
// Please copy the full, valid code from src1/components/dailyWorkStatus/DWSDailyEntryTab.tsx here if not already done.

                  {/* Date/Time */}
                  <Text style={[styles.cell, { width: 100 }]}>{formatDateTime(entry.dateTime)}</Text>
                  
                  {/* Main Activity */}
                  <View style={[styles.cell, { width: 250 }]}>
                    {Platform.OS === 'web' ? (
                      <textarea
                        style={{
                          width: '100%',
                          minHeight: '36px',
                          padding: '6px 8px',
                          border: '1px solid #E5E7EB',
                          borderRadius: '4px',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          resize: 'vertical'
                        }}
                        placeholder="Enter main activity..."
                        defaultValue={entry.mainActivity}
                        onBlur={(e: any) => {
                          if (e.target.value !== entry.mainActivity) {
                            handleUpdateEntry(entry.id, 'mainActivity', e.target.value);
                          }
                        }}
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                      />
                    ) : (
                      <TextInput
                        style={styles.cellInput}
                        placeholder="Enter main activity..."
                        value={entry.mainActivity}
                        onChangeText={(text) => handleUpdateEntry(entry.id, 'mainActivity', text)}
                        multiline
                        autoCorrect={false}
                        autoCapitalize="none"
                        spellCheck={false}
                      />
                    )}
                    {/* Status Updates - horizontal, wrapping, spanning Main Activity to Final Status */}
                    {/* Status Updates - horizontal, wrapping, spanning Main Activity to Final Status */}
                    {Platform.OS === 'web' ? (
                      <div className="dws-status-row-web">
                        {entry.statusUpdates?.filter(u => u.note).map((update, idx) => {
                          const timestamp = formatTimestamp(update.timestamp);
                          return (
                            <div key={idx}>
                              <div style={{ fontSize: 12, color: '#856404', fontWeight: 600, marginBottom: 4 }}>{timestamp || 'Status Update'}</div>
                              <div style={{ fontSize: 14, color: '#856404', whiteSpace: 'pre-line' }}>{update.note}</div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <View style={styles.statusUpdatesRowContainer}>
                        {entry.statusUpdates?.filter(u => u.note).map((update, idx) => {
                          const timestamp = formatTimestamp(update.timestamp);
                          return (
                            <View key={idx} style={styles.statusUpdateCard}>
                              <Text style={styles.statusTimestamp}>{timestamp || 'Status Update'}</Text>
                              <Text style={styles.statusUpdateNote}>{update.note}</Text>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                  
                  {/* Start Date */}
                  <View style={[styles.cell, { width: 120 }]}>
                    {Platform.OS === 'web' ? (
                      <input
                        type="date"
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #E5E7EB',
                          borderRadius: '4px',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          cursor: 'pointer'
                        }}
                        value={(function() {
                          if (!entry.startDate) return '';
                          try {
                            const date = new Date(entry.startDate);
                            return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : '';
                          } catch (e) {
                            return '';
                          }
                        })()}
                        onClick={(e: any) => e.stopPropagation()}
                        onChange={(e: any) => {
                          e.stopPropagation();
                          const dateValue = e.target.value;
                          if (dateValue) {
                            const date = new Date(dateValue);
                            // Validate: if target date exists, start date must be <= target date
                            if (entry.targetDate) {
                              const targetDate = new Date(entry.targetDate);
                              if (date > targetDate) {
                                if (Platform.OS === 'web') {
                                  window.alert('Start Date cannot be later than Target Date. Please select an earlier or equal date.');
                                } else {
                                  Alert.alert('Invalid Date', 'Start Date cannot be later than Target Date. Please select an earlier or equal date.');
                                }
                                return;
                              }
                            }
                            handleUpdateEntry(entry.id, 'startDate', date);
                          } else {
                            handleUpdateEntry(entry.id, 'startDate', null);
                          }
                        }}
                      />
                    ) : (
                      <TextInput
                        style={styles.cellInput}
                        placeholder="DD/MM/YYYY"
                        value={entry.startDate ? (() => {
                          try {
                            const date = new Date(entry.startDate);
                            return !isNaN(date.getTime()) ? date.toLocaleDateString('en-GB') : '';
                          } catch (e) {
                            return '';
                          }
                        })() : ''}
                        onChangeText={(text) => {
                          const parts = text.split('/');
                          if (parts.length === 3) {
                            const day = parseInt(parts[0], 10);
                            const month = parseInt(parts[1], 10) - 1;
                            const year = parseInt(parts[2], 10);
                            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                              const date = new Date(year, month, day);
                              handleUpdateEntry(entry.id, 'startDate', date);
                            }
                          }
                        }}
                      />
                    )}
                  </View>
                  
                  {/* Target Date */}
                  <View style={[styles.cell, { width: 120 }]}>
                    {Platform.OS === 'web' ? (
                      <input
                        type="date"
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #E5E7EB',
                          borderRadius: '4px',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          cursor: 'pointer'
                        }}
                        value={(function() {
                          if (!entry.targetDate) return '';
                          try {
                            const date = new Date(entry.targetDate);
                            return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : '';
                          } catch (e) {
                            return '';
                          }
                        })()}
                        onClick={(e: any) => e.stopPropagation()}
                        onChange={(e: any) => {
                          e.stopPropagation();
                          const dateValue = e.target.value;
                          if (dateValue) {
                            const date = new Date(dateValue);
                            // Validate: if start date exists, target date must be >= start date
                            if (entry.startDate) {
                              const startDate = new Date(entry.startDate);
                              if (date < startDate) {
                                if (Platform.OS === 'web') {
                                  window.alert('Target Date cannot be earlier than Start Date. Please select a later or equal date.');
                                } else {
                                  Alert.alert('Invalid Date', 'Target Date cannot be earlier than Start Date. Please select a later or equal date.');
                                }
                                return;
                              }
                            }
                            handleUpdateEntry(entry.id, 'targetDate', date);
                          } else {
                            handleUpdateEntry(entry.id, 'targetDate', null);
                          }
                        }}
                      />
                    ) : (
                      <TextInput
                        style={styles.cellInput}
                        placeholder="DD/MM/YYYY"
                        value={entry.targetDate ? (() => {
                          try {
                            const date = new Date(entry.targetDate);
                            return !isNaN(date.getTime()) ? date.toLocaleDateString('en-GB') : '';
                          } catch {
                            return '';
                          }
                        })() : ''}
                        onChangeText={(text) => {
                          const parts = text.split('/');
                          if (parts.length === 3) {
                            const day = parseInt(parts[0], 10);
                            const month = parseInt(parts[1], 10) - 1;
                            const year = parseInt(parts[2], 10);
                            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                              const date = new Date(year, month, day);
                              handleUpdateEntry(entry.id, 'targetDate', date);
                            }
                          }
                        }}
                      />
                    )}
                  </View>
                  
                  {/* Assigned To */}
                  <View style={[styles.cell, { width: 130 }]}>
                    <Dropdown
                      options={personnel.map(p => ({ value: p.name, label: p.name }))}
                      value={entry.assignedTo}
                      onSelect={(value) => handleUpdateEntry(entry.id, 'assignedTo', value)}
                      placeholder="Select Person"
                      width={120}
                    />
                  </View>
                  
                  {/* Actions */}
                  <View style={[styles.cell, styles.actionsCell, { width: 80 }]}>  
                    {Platform.OS === 'web' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                        <button 
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#2563EB',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                          onClick={(e: any) => {
                            e.stopPropagation();
                            handleAddStatusUpdate(entry.id);
                          }}
                          title="Add Status Update"
                        >
                          + Status
                        </button>
                        <button 
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#10B981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                          onClick={(e: any) => {
                            console.log('[DWS] + Sub button clicked for entry:', entry.id);
                            e.stopPropagation();
                            handleAddSubActivity(entry.id);
                          }}
                          title="Add Sub Activity"
                        >
                          + Sub
                        </button>
                        <button 
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#EF4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                          onClick={(e: any) => {
                            e.stopPropagation();
                            handleDeleteEntry(entry.id);
                          }}
                          title="Delete Entry"
                        >
                          🗑️
                        </button>
                      </div>
                    ) : (
                      <>
                        <TouchableOpacity 
                          style={styles.actionBtn}
                          onPress={() => handleAddStatusUpdate(entry.id)}
                        >
                          <Text style={styles.actionBtnText}>+ Status</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionBtn, styles.actionBtnSuccess]}
                          onPress={() => handleAddSubActivity(entry.id)}
                        >
                          <Text style={styles.actionBtnText}>+ Sub</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionBtn, styles.actionBtnDanger]}
                          onPress={() => handleDeleteEntry(entry.id)}
                        >
                          <Text style={styles.actionBtnText}>🗑️</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                  
                  {/* Hours */}
                  <View style={[styles.cell, { width: 60 }]}>
                    {Platform.OS === 'web' ? (
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        placeholder="0"
                        value={entry.hours !== undefined && entry.hours !== null ? entry.hours : ''}
                        onChange={(e: any) => {
                          const value = e.target.value;
                          if (value === '') {
                            handleUpdateEntry(entry.id, 'hours', 0);
                          } else {
                            let numValue = parseFloat(value);
                            if (!isNaN(numValue)) {
                              // Convert 0.60 minutes to 1.0 hour, 0.65 to 1.05, etc.
                              const hours = Math.floor(numValue);
                              const minutes = Math.round((numValue - hours) * 100);
                              if (minutes >= 60) {
                                numValue = hours + 1 + (minutes - 60) / 100;
                              }
                              handleUpdateEntry(entry.id, 'hours', Math.round(numValue * 100) / 100);
                            }
                          }
                        }}
                        onKeyDown={(e: any) => {
                          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            e.preventDefault();
                            const currentValue = entry.hours || 0;
                            const step = e.key === 'ArrowUp' ? 0.05 : -0.05;
                            let newValue = Math.round((currentValue + step) * 100) / 100;
                            
                            // Convert minutes to hours when reaching 0.60
                            const hours = Math.floor(newValue);
                            const minutes = Math.round((newValue - hours) * 100);
                            if (minutes >= 60) {
                              newValue = hours + 1;
                            } else if (minutes < 0 && hours > 0) {
                              newValue = hours - 1 + 0.55;
                            }
                            
                            if (newValue >= 0) {
                              handleUpdateEntry(entry.id, 'hours', newValue);
                            }
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          fontSize: '14px',
                          border: '1px solid #E5E7EB',
                          borderRadius: '4px',
                          textAlign: 'center',
                          fontFamily: 'inherit'
                        }}
                      />
                    ) : (
                      <TextInput
                        style={[styles.cellInput, { textAlign: 'center' }]}
                        placeholder="0"
                        value={entry.hours !== undefined && entry.hours !== null ? String(entry.hours) : ''}
                        onChangeText={(text) => {
                          if (text === '') {
                            handleUpdateEntry(entry.id, 'hours', 0);
                            return;
                          }
                          const cleaned = text.replace(/[^0-9.]/g, '');
                          const parts = cleaned.split('.');
                          if (parts.length > 2) return;
                          const numValue = parseFloat(cleaned);
                          if (!isNaN(numValue)) {
                            handleUpdateEntry(entry.id, 'hours', numValue);
                          }
                        }}
                        keyboardType="decimal-pad"
                      />
                    )}
                  </View>
                  
                  {/* Final Status */}
                  <View style={[styles.cell, { width: 120 }]}> 
                    <Dropdown
                      options={statuses.map(status => ({
                        label: status.name,
                        value: status.name,
                        color: status.color
                      }))}
                      value={entry.finalStatus}
                      onSelect={selected => handleUpdateEntry(entry.id, 'finalStatus', selected)}
                      placeholder="Select Status"
                      width={120}
                      showColorBadge={true}
                    />
                  </View>
                </View>
                
                {/* Sub-Activity Rows */}
                {entry.subActivities?.map((sub) => (
                  <View key={sub.id} style={[styles.tableRow, styles.subRow]}>
                    <View style={[styles.cell, { width: 150 }]} />
                    <View style={[styles.cell, { width: 100 }]} />
                    
                    {/* Sub Activity Description */}
                    <View style={[styles.cell, { width: 250 }]}>
                      {Platform.OS === 'web' ? (
                        <textarea
                          style={{
                            width: '100%',
                            minHeight: '36px',
                            padding: '6px 8px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                          }}
                          placeholder="Enter sub activity..."
                          defaultValue={sub.description}
                          onBlur={(e: any) => {
                            if (e.target.value !== sub.description) {
                              handleUpdateSubActivity(entry.id, sub.id, 'description', e.target.value);
                            }
                          }}
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck={false}
                        />
                      ) : (
                        <TextInput
                          style={styles.cellInput}
                          placeholder="Enter sub activity..."
                          value={sub.description}
                          onChangeText={(text) => handleUpdateSubActivity(entry.id, sub.id, 'description', text)}
                          multiline
                        />
                      )}
                      {/* Sub-Activity Status Updates */}
                      <View style={styles.statusUpdatesRowContainer}>
                        {sub.statusUpdates?.filter(u => u.note).map((update, idx) => {
                          const timestamp = formatTimestamp(update.timestamp);
                          return (
                            <View key={idx} style={styles.statusUpdateCard}>
                              <Text style={styles.statusTimestamp}>
                                {timestamp || 'Status Update'}
                              </Text>
                              <Text style={styles.statusUpdateNote}>{update.note}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                    
                    {/* Start Date */}
                    <View style={[styles.cell, { width: 120 }]}>
                      {Platform.OS === 'web' ? (
                        <input
                          type="date"
                          value={sub.startDate ? (() => {
                            try {
                              const date = new Date(sub.startDate);
                              return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : '';
                            } catch (e) {
                              return '';
                            }
                          })() : ''}
                          onClick={(e: any) => {
                            e.stopPropagation();
                          }}
                          onChange={(e: any) => {
                            const dateValue = e.target.value;
                            if (dateValue) {
                              const date = new Date(dateValue);
                              // Validate: if target date exists, start date must be <= target date
                              if (sub.targetDate) {
                                const targetDate = new Date(sub.targetDate);
                                if (date > targetDate) {
                                  if (Platform.OS === 'web') {
                                    window.alert('Start Date cannot be later than Target Date. Please select an earlier or equal date.');
                                  } else {
                                    Alert.alert('Invalid Date', 'Start Date cannot be later than Target Date. Please select an earlier or equal date.');
                                  }
                                  return;
                                }
                              }
                              handleUpdateSubActivity(entry.id, sub.id, 'startDate', date);
                            } else {
                              handleUpdateSubActivity(entry.id, sub.id, 'startDate', undefined);
                            }
                          }}
                          onFocus={(e: any) => {
                            e.stopPropagation();
                          }}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            fontSize: '14px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '4px',
                            fontFamily: 'inherit',
                            cursor: 'pointer'
                          }}
                        />
                      ) : (
                        <TextInput
                          style={styles.cellInput}
                          placeholder="DD/MM/YYYY"
                          value={sub.startDate ? (() => {
                            try {
                              const date = new Date(sub.startDate);
                              return !isNaN(date.getTime()) ? date.toLocaleDateString('en-GB') : '';
                            } catch (e) {
                              return '';
                            }
                          })() : ''}
                          onChangeText={(text) => {
                            const parts = text.split('/');
                            if (parts.length === 3) {
                              const day = parseInt(parts[0], 10);
                              const month = parseInt(parts[1], 10) - 1;
                              const year = parseInt(parts[2], 10);
                              if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                                const date = new Date(year, month, day);
                                handleUpdateSubActivity(entry.id, sub.id, 'startDate', date);
                              }
                            }
                          }}
                        />
                      )}
                    </View>
                    
                    {/* Target Date */}
                    <View style={[styles.cell, { width: 120 }]}>
                      {Platform.OS === 'web' ? (
                        <input
                          type="date"
                          value={sub.targetDate ? (() => {
                            try {
                              const date = new Date(sub.targetDate);
                              return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : '';
                            } catch (e) {
                              return '';
                            }
                          })() : ''}
                          onClick={(e: any) => {
                            e.stopPropagation();
                          }}
                          onChange={(e: any) => {
                            const dateValue = e.target.value;
                            if (dateValue) {
                              const date = new Date(dateValue);
                              // Validate: if start date exists, target date must be >= start date
                              if (sub.startDate) {
                                const startDate = new Date(sub.startDate);
                                if (date < startDate) {
                                  if (Platform.OS === 'web') {
                                    window.alert('Target Date cannot be earlier than Start Date. Please select a later or equal date.');
                                  } else {
                                    Alert.alert('Invalid Date', 'Target Date cannot be earlier than Start Date. Please select a later or equal date.');
                                  }
                                  return;
                                }
                              }
                              handleUpdateSubActivity(entry.id, sub.id, 'targetDate', date);
                            } else {
                              handleUpdateSubActivity(entry.id, sub.id, 'targetDate', undefined);
                            }
                          }}
                          onFocus={(e: any) => {
                            e.stopPropagation();
                          }}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            fontSize: '14px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '4px',
                            fontFamily: 'inherit',
                            cursor: 'pointer'
                          }}
                        />
                      ) : (
                        <TextInput
                          style={styles.cellInput}
                          placeholder="DD/MM/YYYY"
                          value={sub.targetDate ? (() => {
                            try {
                              const date = new Date(sub.targetDate);
                              return !isNaN(date.getTime()) ? date.toLocaleDateString('en-GB') : '';
                            } catch (e) {
                              return '';
                            }
                          })() : ''}
                          onChangeText={(text) => {
                            const parts = text.split('/');
                            if (parts.length === 3) {
                              const day = parseInt(parts[0], 10);
                              const month = parseInt(parts[1], 10) - 1;
                              const year = parseInt(parts[2], 10);
                              if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                                const date = new Date(year, month, day);
                                handleUpdateSubActivity(entry.id, sub.id, 'targetDate', date);
                              }
                            }
                          }}
                        />
                      )}
                    </View>
                    
                    {/* Assigned To */}
                    <View style={[styles.cell, { width: 130 }]}>
                      <Dropdown
                        options={personnel.map(p => ({ value: p.name, label: p.name }))}
                        value={sub.assignedTo}
                        onSelect={(value) => handleUpdateSubActivity(entry.id, sub.id, 'assignedTo', value)}
                        placeholder="Select Person"
                        width={120}
                      />
                    </View>
                    
                    {/* Actions */}
                    <View style={[styles.cell, styles.actionsCell, { width: 80 }]}>
                      {Platform.OS === 'web' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                          <button 
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#2563EB',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap'
                            }}
                            onClick={(e: any) => {
                              e.stopPropagation();
                              handleAddSubActivityStatusUpdate(entry.id, sub.id);
                            }}
                            title="Add Status Update"
                          >
                            + Status
                          </button>
                          <button 
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#EF4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                            onClick={(e: any) => {
                              e.stopPropagation();
                              handleDeleteSubActivity(entry.id, sub.id);
                            }}
                            title="Delete Sub Activity"
                          >
                            🗑️
                          </button>
                        </div>
                      ) : (
                        <>
                          <TouchableOpacity 
                            style={styles.actionBtn}
                            onPress={() => handleAddSubActivityStatusUpdate(entry.id, sub.id)}
                          >
                            <Text style={styles.actionBtnText}>+ Status</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.actionBtn, styles.actionBtnDanger]}
                            onPress={() => handleDeleteSubActivity(entry.id, sub.id)}
                          >
                            <Text style={styles.actionBtnText}>🗑️</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                    
                    {/* Hours */}
                    <View style={[styles.cell, { width: 60 }]}>
                      {Platform.OS === 'web' ? (
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          placeholder="0"
                          value={sub.hours !== undefined && sub.hours !== null ? sub.hours : ''}
                          onChange={(e: any) => {
                            const value = e.target.value;
                            if (value === '') {
                              handleUpdateSubActivity(entry.id, sub.id, 'hours', 0);
                            } else {
                              let numValue = parseFloat(value);
                              if (!isNaN(numValue)) {
                                // Convert 0.60 minutes to 1.0 hour, 0.65 to 1.05, etc.
                                const hours = Math.floor(numValue);
                                const minutes = Math.round((numValue - hours) * 100);
                                if (minutes >= 60) {
                                  numValue = hours + 1 + (minutes - 60) / 100;
                                }
                                handleUpdateSubActivity(entry.id, sub.id, 'hours', Math.round(numValue * 100) / 100);
                              }
                            }
                          }}
                          onKeyDown={(e: any) => {
                            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                              e.preventDefault();
                              const currentValue = sub.hours || 0;
                              const step = e.key === 'ArrowUp' ? 0.05 : -0.05;
                              let newValue = Math.round((currentValue + step) * 100) / 100;
                              
                              // Convert minutes to hours when reaching 0.60
                              const hours = Math.floor(newValue);
                              const minutes = Math.round((newValue - hours) * 100);
                              if (minutes >= 60) {
                                newValue = hours + 1;
                              } else if (minutes < 0 && hours > 0) {
                                newValue = hours - 1 + 0.55;
                              }
                              
                              if (newValue >= 0) {
                                handleUpdateSubActivity(entry.id, sub.id, 'hours', newValue);
                              }
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            fontSize: '14px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '4px',
                            textAlign: 'center',
                            fontFamily: 'inherit'
                          }}
                        />
                      ) : (
                        <TextInput
                          style={[styles.cellInput, { textAlign: 'center' }]}
                          placeholder="0"
                          value={sub.hours !== undefined && sub.hours !== null ? String(sub.hours) : ''}
                          onChangeText={(text) => {
                            if (text === '') {
                              handleUpdateSubActivity(entry.id, sub.id, 'hours', 0);
                              return;
                            }
                            const cleaned = text.replace(/[^0-9.]/g, '');
                            const parts = cleaned.split('.');
                            if (parts.length > 2) return;
                            const numValue = parseFloat(cleaned);
                            if (!isNaN(numValue)) {
                              handleUpdateSubActivity(entry.id, sub.id, 'hours', numValue);
                            }
                          }}
                          keyboardType="decimal-pad"
                        />
                      )}
                    </View>
                    
                    {/* Status */}
                    <View style={[styles.cell, { width: 120 }]}>
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        style={{ maxHeight: 100 }}
                        contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}
                      >
                        {statuses.map(status => (
                          <TouchableOpacity
                            key={status.id}
                            style={[
                              styles.statusChip,
                              { borderColor: status.color },
                              sub.status === status.name && { backgroundColor: status.color }
                            ]}
                            onPress={() => handleUpdateSubActivity(entry.id, sub.id, 'status', status.name)}
                          >
                            <Text style={[
                              styles.statusChipText,
                              sub.status === status.name && { color: '#fff', fontWeight: '600' }
                            ]}>
                              {status.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                ))}
              </View>
            ))}
            
            {filteredEntries.length === 0 && (
              <View style={styles.emptyRow}>
                <Text style={styles.emptyText}>No entries found. Click + to add a new entry.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </ScrollView>
      
      {/* Add Button */}
      {/* Add Button for native remains at bottom */}
      {Platform.OS !== 'web' && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddNewRow}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>+</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  loadingText: {
    marginTop: 12,
    color: colors.TEXT_SECONDARY
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
    padding: spacing.lg
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md
  },
  filterInput: {
    flex: 1,
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 14,
    backgroundColor: '#fff'
  },
  filterPickerContainer: {
    minWidth: 150
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: '#E9ECEF',
    borderRadius: 16,
    marginRight: spacing.xs
  },
  filterChipActive: {
    backgroundColor: colors.ACTION_BLUE
  },
  filterChipText: {
    fontSize: 14,
    color: colors.TEXT_PRIMARY
  },
  filterChipTextActive: {
    color: '#fff'
  },
  tableScroll: {
    flex: 1
  },
  tableContainer: {
    backgroundColor: '#fff',
    margin: spacing.lg,
    marginTop: 0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      web: { boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }
    })
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.ACTION_BLUE,
    paddingVertical: spacing.md,
    zIndex: 10
  },
  headerCell: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    paddingHorizontal: spacing.sm,
    textAlign: 'left'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 60,
    alignItems: 'flex-start',
    paddingVertical: spacing.sm
  },
  alternateRow: {
    backgroundColor: '#F9FAFB'
  },
  subRow: {
    backgroundColor: '#F8F9FA'
  },
  cell: {
    paddingHorizontal: spacing.sm,
    justifyContent: 'center'
  },
  cellInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 14,
    backgroundColor: '#fff',
    minHeight: 36
  },
  actionsCell: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4
  },
  actionBtn: {
    backgroundColor: colors.ACTION_BLUE,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4
  },
  actionBtnSuccess: {
    backgroundColor: '#28a745'
  },
  actionBtnDanger: {
    backgroundColor: '#dc3545'
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500'
  },
  selectChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB'
  },
  selectChipActive: {
    backgroundColor: colors.ACTION_BLUE,
    borderColor: colors.ACTION_BLUE
  },
  selectChipText: {
    fontSize: 14,
    color: colors.TEXT_PRIMARY
  },
  selectChipTextActive: {
    color: '#fff'
  },
  statusChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 4,
    marginRight: 4,
    borderWidth: 2
  },
  statusChipText: {
    fontSize: 14,
    color: colors.TEXT_PRIMARY
  },
  statusUpdatesContainer: {
    // legacy, not used
  },
  statusUpdatesRowContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 8,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  statusUpdateCard: {
    backgroundColor: '#FFF3CD',
    padding: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
    borderRadius: 4,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    minWidth: 180,
    maxWidth: 260,
    flexShrink: 0,
    flexGrow: 0,
    display: 'flex',
  },
  statusUpdate: {
    backgroundColor: '#FFF3CD',
    padding: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
    borderRadius: 4,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    minWidth: 230, // FIX: Changed from 'width' to 'minWidth' for consistent flex behavior
    flexShrink: 0, // Prevents shrinking below minWidth, forcing wrap
    flexGrow: 0, // FIX: Prevents growing to fill remaining space
  },
  statusTimestamp: {
    fontSize: 14,
    color: colors.TEXT_PRIMARY,
    fontWeight: '600',
    marginBottom: 2
  },
  statusUpdateNote: {
    fontSize: 14,
    color: colors.TEXT_PRIMARY,
    fontWeight: '400'
  },
  statusUpdateText: {
    fontSize: 14,
    color: colors.TEXT_PRIMARY
  },
  emptyRow: {
    padding: spacing.xl,
    alignItems: 'center'
  },
  emptyText: {
    color: colors.TEXT_SECONDARY,
    fontStyle: 'italic'
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(0,0,0,0.3)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8
      }
    })
  },
  addButtonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '300',
    marginTop: -2
  }
});
